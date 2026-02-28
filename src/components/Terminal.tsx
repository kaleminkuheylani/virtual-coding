"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useTerminalSocket } from "@/hooks/useTerminalSocket";

function getWsUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/terminal/ws`;
}

export function Terminal({
  expanded,
  onToggleExpanded,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  useEffect(() => {
    setWsUrl(getWsUrl());
  }, []);

  const handleData = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  const { connected, sendInput, sendResize } = useTerminalSocket(wsUrl ?? "", handleData);

  useEffect(() => {
    if (!terminalContainerRef.current || !wsUrl) return;

    const terminal = new XTerm({
      convertEol: false,
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
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalContainerRef.current);
    fitAddon.fit();
    terminal.focus();

    terminal.onData((data) => sendInput(data));
    terminal.onResize(({ cols, rows }) => sendResize(cols, rows));

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

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
  }, [wsUrl, sendInput, sendResize]);

  useEffect(() => {
    const timer = window.setTimeout(() => fitAddonRef.current?.fit(), 50);
    return () => window.clearTimeout(timer);
  }, [expanded]);

  return (
    <section className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Terminal</h3>
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} title={connected ? "Bağlı" : "Bağlantı bekleniyor..."} />
        </div>
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
    </section>
  );
}
