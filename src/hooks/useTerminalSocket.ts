"use client";

import { useEffect, useRef, useState } from "react";

export function useTerminalSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "output") {
        setOutput((prev) => prev + message.data);
      }
    };

    return () => ws.close();
  }, [url]);

  function sendInput(data: string) {
    wsRef.current?.send(JSON.stringify({ type: "input", data }));
  }

  function sendCommand(data: string) {
    wsRef.current?.send(JSON.stringify({ type: "command", data }));
  }

  return { connected, output, sendInput, sendCommand };
}
