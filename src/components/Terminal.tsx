"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export function Terminal({
  onRun,
  expanded,
  onToggleExpanded,
}: {
  onRun: (command: string) => Promise<string>;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
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
        background: "#020617",
        foreground: "#e2e8f0",
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

  useEffect(() => {
    const timer = window.setTimeout(() => fitAddonRef.current?.fit(), 50);
    return () => window.clearTimeout(timer);
  }, [expanded]);

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
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Terminal</h3>
        <button
          onClick={onToggleExpanded}
          className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
        >
          {expanded ? "Daralt" : "Genişlet"}
        </button>
      </div>
      <div
        ref={terminalContainerRef}
        className={`mt-2 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-2 ${expanded ? "h-56" : "h-32"}`}
      />
      <div className="mt-2 flex gap-2">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleRun();
            }
          }}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none transition focus:border-violet-400"
        />
        <button onClick={() => void handleRun()} className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-medium text-white hover:bg-violet-500">Run</button>
      </div>
    </section>
  );
}
