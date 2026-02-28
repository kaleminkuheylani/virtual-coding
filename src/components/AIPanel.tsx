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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
      <h3 className="font-semibold">AI Assistant</h3>
      <textarea
        className="mt-3 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-sm outline-none transition focus:border-violet-400"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-violet-500" onClick={runPrompt}>Send</button>
        <button className="rounded-lg border border-slate-700 px-2 py-1 text-sm hover:border-slate-500" onClick={() => setPrompt("Debug this code")}>Debug</button>
        <button className="rounded-lg border border-slate-700 px-2 py-1 text-sm hover:border-slate-500" onClick={() => setPrompt("Refactor this code")}>Refactor</button>
      </div>
      <pre className="mt-3 h-44 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">{response || "No AI output yet."}</pre>
    </section>
  );
}
