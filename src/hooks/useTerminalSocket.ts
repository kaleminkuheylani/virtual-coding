"use client";

import { useEffect, useRef, useState } from "react";

export function useTerminalSocket(url: string, onData: (data: string) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onDataRef = useRef(onData);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as { type: string; data?: string };
      if (message.type === "output" && message.data) {
        onDataRef.current(message.data);
      }
    };

    return () => ws.close();
  }, [url]);

  function sendInput(data: string) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "input", data }));
    }
  }

  function sendCommand(data: string, plan?: "free" | "starter" | "pro") {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", data, plan }));
    }
  }

  function sendResize(cols: number, rows: number) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "resize", cols, rows }));
    }
  }

  return { connected, sendInput, sendCommand, sendResize };
}
