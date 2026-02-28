"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import "xterm/css/xterm.css";

export function Terminal({ onRun }: { onRun: (command: string) => Promise<string> }) {
  const [command, setCommand] = useState("");
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalContainerRef.current) {
      return;
    }

    const terminal = new XTerm({
      convertEol: true,
      fontSize: 12,
      theme: {
        background: "#000000",
        foreground: "#9FEF00",
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    terminal.writeln("Ready...");

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const onResize = () => fitAddon.fit();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  async function handleRun() {
    if (!command.trim()) {
      return;
    }

    terminalRef.current?.writeln(`$ ${command}`);
    const result = await onRun(command);
    terminalRef.current?.writeln(result || "(no output)");
    setCommand("");
    fitAddonRef.current?.fit();
  }

  return (
    <section className="rounded-xl border p-3">
      <h3 className="font-semibold">Terminal</h3>
      <div ref={terminalContainerRef} className="mt-2 h-44 overflow-hidden rounded bg-black p-2" />
      <div className="mt-2 flex gap-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleRun();
            }
          }}
          className="flex-1 rounded border px-2 py-1"
        />
        <button onClick={() => void handleRun()} className="rounded bg-blue-600 px-3 py-1 text-white">Run</button>
      </div>
    </section>
  );
}
