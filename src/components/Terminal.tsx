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
  const onRunRef = useRef(onRun);
  const commandRef = useRef("");
  const runningRef = useRef(false);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    if (!terminalContainerRef.current) {
      return;
    }

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
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    terminal.writeln("Ready...");
    terminal.write("$ ");

    const runCommand = async () => {
      const nextCommand = commandRef.current.trim();
      if (!nextCommand || runningRef.current) {
        terminal.write("\r\n$ ");
        commandRef.current = "";
        setCommand("");
        return;
      }

      runningRef.current = true;
      terminal.write("\r\n");
      const result = await onRunRef.current(nextCommand);
      terminal.writeln(result || "(no output)");
      commandRef.current = "";
      setCommand("");
      terminal.write("$ ");
      runningRef.current = false;
      fitAddon.fit();
    };

    terminal.onData((data) => {
      if (runningRef.current) {
        return;
      }

      if (data === "\r") {
        void runCommand();
        return;
      }

      if (data === "\u007f") {
        if (commandRef.current.length > 0) {
          commandRef.current = commandRef.current.slice(0, -1);
          setCommand(commandRef.current);
          terminal.write("\b \b");
        }
        return;
      }

      if (/^[\x20-\x7E]$/.test(data)) {
        commandRef.current += data;
        setCommand(commandRef.current);
        terminal.write(data);
      }
    });

    terminal.focus();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const onResize = () => fitAddon.fit();
    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalContainerRef.current);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
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
    const currentCommand = command.trim();
    if (!currentCommand || runningRef.current) {
      return;
    }

    runningRef.current = true;
    terminalRef.current?.writeln(`$ ${currentCommand}`);
    const result = await onRun(currentCommand);
    terminalRef.current?.writeln(result || "(no output)");
    terminalRef.current?.write("$ ");
    setCommand("");
    commandRef.current = "";
    runningRef.current = false;
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
        onClick={() => terminalRef.current?.focus()}
        className={`terminal-shell mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 ${expanded ? "h-64" : "h-40"}`}
      />
      <div className="mt-2 flex gap-2">
        <input
          value={command}
          onChange={(e) => {
            setCommand(e.target.value);
            commandRef.current = e.target.value;
          }}
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
