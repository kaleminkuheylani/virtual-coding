"use client";

import { useState } from "react";

export function Terminal({ onRun }: { onRun: (command: string) => Promise<string> }) {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");

  async function handleRun() {
    const result = await onRun(command);
    setOutput((prev) => `${prev}\n$ ${command}\n${result}`);
    setCommand("");
  }

  return (
    <section className="rounded-xl border p-3">
      <h3 className="font-semibold">Terminal</h3>
      <pre className="mt-2 h-44 overflow-auto rounded bg-black p-2 text-xs text-green-300">{output || "Ready..."}</pre>
      <div className="mt-2 flex gap-2">
        <input value={command} onChange={(e) => setCommand(e.target.value)} className="flex-1 rounded border px-2 py-1" />
        <button onClick={handleRun} className="rounded bg-blue-600 px-3 py-1 text-white">Run</button>
      </div>
    </section>
  );
}
