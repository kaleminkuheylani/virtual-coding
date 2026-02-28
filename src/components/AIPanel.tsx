"use client";

import { useState } from "react";
import type { PlanType } from "@/lib/plans";

export function AIPanel({ plan }: { plan: PlanType }) {
  const [prompt, setPrompt] = useState("Explain this file.");
  const [response, setResponse] = useState("");

  async function runPrompt() {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, plan }),
    });
    const data = await res.json();
    setResponse(data.reply ?? data.error ?? "No response");
  }

  return (
    <section className="rounded-xl border p-3">
      <h3 className="font-semibold">AI Assistant</h3>
      <textarea className="mt-2 w-full rounded border p-2 text-sm" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div className="mt-2 flex gap-2">
        <button className="rounded bg-violet-600 px-3 py-1 text-white" onClick={runPrompt}>Send</button>
        <button className="rounded border px-2 py-1" onClick={() => setPrompt("Debug this code")}>Debug</button>
        <button className="rounded border px-2 py-1" onClick={() => setPrompt("Refactor this code")}>Refactor</button>
      </div>
      <pre className="mt-2 h-40 overflow-auto rounded bg-gray-50 p-2 text-xs">{response || "No AI output yet."}</pre>
    </section>
  );
}
