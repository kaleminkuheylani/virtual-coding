import { spawn } from 'child_process'

const PORT = 3004

// Map WebSocket instances to their shell processes
const shells = new WeakMap<object, ReturnType<typeof spawn>>()

const server = Bun.serve({
  port: PORT,

  fetch(req, server) {
    if (server.upgrade(req)) return undefined
    return new Response('Terminal WebSocket server', { status: 200 })
  },

  websocket: {
    open(ws) {
      const shell = spawn('/bin/bash', [], {
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          HOME: process.env.HOME || '/home/user',
        },
        cwd: process.env.HOME || '/home/user',
      })

      shells.set(ws, shell)

      shell.stdout?.on('data', (data: Buffer) => {
        try { ws.send(data) } catch {}
      })

      shell.stderr?.on('data', (data: Buffer) => {
        try { ws.send(data) } catch {}
      })

      shell.on('close', () => {
        try { ws.close() } catch {}
      })

      shell.on('error', (err) => {
        console.error('Shell error:', err)
        try { ws.close() } catch {}
      })
    },

    message(ws, message: string | Buffer) {
      const shell = shells.get(ws)
      if (shell?.stdin?.writable) {
        shell.stdin.write(message)
      }
    },

    close(ws) {
      const shell = shells.get(ws)
      if (shell) {
        shell.kill()
      }
    },

    error(ws, error) {
      console.error('WebSocket error:', error)
      const shell = shells.get(ws)
      if (shell) shell.kill()
    },
  },
})

console.log(`Terminal WebSocket server running on port ${PORT}`)

process.on('SIGTERM', () => {
  process.exit(0)
})

process.on('SIGINT', () => {
  process.exit(0)
})
