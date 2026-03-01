"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// NOTE: This port must match PORT in mini-services/terminal/index.ts
const TERMINAL_WS_PORT = 3004

interface TerminalProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function Terminal({ expanded, onToggleExpanded }: TerminalProps) {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize terminal and connect to WebSocket shell server
  useEffect(() => {
    if (!terminalContainerRef.current) return;

    const terminal = new XTerm({
      convertEol: true,
      fontSize: 13,
      fontFamily: "JetBrains Mono, Fira Code, Menlo, Monaco, monospace",
      lineHeight: 1.3,
      scrollback: 2000,
      cursorStyle: "block",
      rightClickSelectsWord: true,
      theme: {
        background: "#020617",
        foreground: "#e2e8f0",
        cursor: "#7c3aed",
        selectionBackground: "#7c3aed55",
        black: "#1e293b",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#facc15",
        blue: "#60a5fa",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#f1f5f9",
        brightBlack: "#475569",
        brightRed: "#fca5a5",
        brightGreen: "#86efac",
        brightYellow: "#fde047",
        brightBlue: "#93c5fd",
        brightMagenta: "#d8b4fe",
        brightCyan: "#67e8f9",
        brightWhite: "#f8fafc",
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    terminal.focus();

    // Welcome message
    terminal.writeln("\x1b[1;35m╭─────────────────────────────────────╮\x1b[0m");
    terminal.writeln("\x1b[1;35m│\x1b[0m  \x1b[1;37mVirtual IDE Terminal\x1b[0m              \x1b[1;35m│\x1b[0m");
    terminal.writeln("\x1b[1;35m│\x1b[0m  \x1b[90mConnecting to shell...\x1b[0m          \x1b[1;35m│\x1b[0m");
    terminal.writeln("\x1b[1;35m╰─────────────────────────────────────╯\x1b[0m");
    terminal.writeln("");

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Connect to terminal WebSocket server via Caddy's XTransformPort routing
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/?XTransformPort=${TERMINAL_WS_PORT}`
    )
    ws.binaryType = "arraybuffer"

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onclose = () => {
      setConnected(false)
      terminal.writeln("\r\n\x1b[1;31m[Connection closed]\x1b[0m")
    }

    ws.onerror = () => {
      setConnected(false)
      terminal.writeln("\r\n\x1b[1;31m[Connection error - is the terminal server running?]\x1b[0m")
    }

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        terminal.write(new Uint8Array(event.data))
      } else {
        terminal.write(event.data as string)
      }
    }

    // Forward all key input to the shell
    terminal.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      ws.close();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  // Resize on expand/collapse
  useEffect(() => {
    const timer = window.setTimeout(() => fitAddonRef.current?.fit(), 50);
    return () => window.clearTimeout(timer);
  }, [expanded]);

  return (
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-slate-200">Terminal</h3>
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
            title={connected ? "Bağlı" : "Bağlantı bekleniyor..."}
          />
        </div>
        <button
          onClick={onToggleExpanded}
          className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          {expanded ? "Daralt" : "Genişlet"}
        </button>
      </div>

      {/* Terminal container */}
      <div
        ref={terminalContainerRef}
        onClick={() => terminalRef.current?.focus()}
        className={`terminal-shell w-full bg-slate-950 ${
          expanded ? "h-64" : "h-40"
        }`}
        style={{ padding: "8px" }}
      />
    </section>
  );
}

