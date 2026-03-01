"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function Terminal({ expanded, onToggleExpanded }: TerminalProps) {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize terminal
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
    terminal.writeln("\x1b[1;35m│\x1b[0m  \x1b[90mReady for commands...\x1b[0m           \x1b[1;35m│\x1b[0m");
    terminal.writeln("\x1b[1;35m╰─────────────────────────────────────╯\x1b[0m");
    terminal.writeln("");
    terminal.write("\x1b[1;32m➜\x1b[0m \x1b[1;34m~/workspace\x1b[0m $ ");

    // Handle input
    let currentLine = "";
    terminal.onData((data) => {
      const code = data.charCodeAt(0);

      if (code === 13) {
        // Enter
        terminal.writeln("");
        if (currentLine.trim()) {
          handleCommand(currentLine.trim(), terminal);
        } else {
          terminal.write("\x1b[1;32m➜\x1b[0m \x1b[1;34m~/workspace\x1b[0m $ ");
        }
        currentLine = "";
      } else if (code === 127) {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write("\b \b");
        }
      } else if (code === 27) {
        // Escape sequences (arrow keys, etc.)
        // Ignore for now
      } else if (code >= 32) {
        // Printable characters
        currentLine += data;
        terminal.write(data);
      }
    });

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Simulate connection
    setTimeout(() => setConnected(true), 500);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalContainerRef.current);

    const onWindowResize = () => fitAddon.fit();
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      resizeObserver.disconnect();
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

// Simple command handler
function handleCommand(cmd: string, terminal: XTerm) {
  const parts = cmd.split(" ");
  const command = parts[0];

  switch (command) {
    case "help":
      terminal.writeln("\x1b[1;36mKullanılabilir komutlar:\x1b[0m");
      terminal.writeln("  \x1b[33mhelp\x1b[0m     - Bu yardım mesajını göster");
      terminal.writeln("  \x1b[33mclear\x1b[0m    - Terminali temizle");
      terminal.writeln("  \x1b[33mls\x1b[0m       - Dosyaları listele");
      terminal.writeln("  \x1b[33mpwd\x1b[0m      - Geçerli dizini göster");
      terminal.writeln("  \x1b[33mecho\x1b[0m     - Mesaj yazdır");
      terminal.writeln("  \x1b[33mdate\x1b[0m     - Tarih ve saat göster");
      terminal.writeln("  \x1b[33mwhoami\x1b[0m   - Kullanıcı adını göster");
      break;

    case "clear":
      terminal.clear();
      break;

    case "ls":
      terminal.writeln("\x1b[1;34mREADME.md\x1b[0m  \x1b[1;32msrc/\x1b[0m  \x1b[1;32mcomponents/\x1b[0m  \x1b[1;32mhooks/\x1b[0m  \x1b[1;33mpackage.json\x1b[0m  \x1b[1;33mtsconfig.json\x1b[0m");
      break;

    case "pwd":
      terminal.writeln("/home/user/workspace");
      break;

    case "echo":
      terminal.writeln(parts.slice(1).join(" "));
      break;

    case "date":
      terminal.writeln(new Date().toLocaleString("tr-TR"));
      break;

    case "whoami":
      terminal.writeln("developer");
      break;

    case "":
      break;

    default:
      terminal.writeln(`\x1b[1;31mkomut bulunamadı: ${command}\x1b[0m`);
      terminal.writeln(`\x1b[90mYardım için 'help' yazın\x1b[0m`);
  }

  terminal.write("\x1b[1;32m➜\x1b[0m \x1b[1;34m~/workspace\x1b[0m $ ");
}
