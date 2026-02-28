import http from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import pty from "node-pty";
import { validateCommand } from "../src/lib/security";

const PORT = Number(process.env.WS_PORT ?? 3001);

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ status: "ws-ok" }));
});

const wss = new WebSocketServer({ server, path: "/api/terminal/ws" });

wss.on("connection", (socket) => {
  const sessionId = randomUUID();
  const shell = pty.spawn("bash", ["-l"], {
    name: "xterm-color",
    cols: 100,
    rows: 28,
    cwd: process.env.WORKSPACE_ROOT ?? "/workspace/demo-user",
    env: process.env as Record<string, string>,
  });

  socket.send(JSON.stringify({ type: "session", sessionId }));

  shell.onData((data) => socket.send(JSON.stringify({ type: "output", data })));
  shell.onExit(({ exitCode }) => socket.send(JSON.stringify({ type: "exit", exitCode })));

  socket.on("message", (raw) => {
    const message = JSON.parse(raw.toString()) as { type: string; data?: string; cols?: number; rows?: number; plan?: "free" | "starter" | "pro" };

    if (message.type === "resize" && message.cols && message.rows) {
      shell.resize(message.cols, message.rows);
      return;
    }

    if (message.type === "command" && message.data) {
      const validation = validateCommand(message.data, message.plan ?? "free");
      if (!validation.ok) {
        socket.send(JSON.stringify({ type: "error", message: validation.message, suggestion: validation.suggestion }));
        return;
      }
      shell.write(`${message.data}\n`);
      return;
    }

    if (message.type === "input" && message.data) {
      shell.write(message.data);
    }
  });

  socket.on("close", () => shell.kill());
});

server.listen(PORT, () => {
  console.log(`Terminal WebSocket server listening on :${PORT}`);
});
