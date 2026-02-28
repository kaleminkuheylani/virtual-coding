"use client";

import { useMemo, useState } from "react";
import type { PlanType } from "@/lib/plans";
import type { AiProvider } from "@/lib/ai";

const PROVIDER_MODELS: Record<AiProvider, string[]> = {
  openrouter: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.1-70b-instruct"],
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"],
};

export function AIPanel({ plan }: { plan: PlanType }) {
  const [prompt, setPrompt] = useState("Explain this file.");
  const [response, setResponse] = useState("");
  const [provider, setProvider] = useState<AiProvider>("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("Doğrulanmadı");

  const models = useMemo(() => PROVIDER_MODELS[provider], [provider]);
  const [model, setModel] = useState(PROVIDER_MODELS.openrouter[0]);

  async function runPrompt() {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, plan, provider, model, apiKey }),
    });
    const data = await res.json();
    setResponse(data.reply ?? data.error ?? "No response");
  }

  async function verifyCurrentProvider() {
    setVerifyStatus("Doğrulanıyor...");
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "verify", provider, apiKey, model }),
    });

    const data = (await res.json()) as { ok?: boolean };
    setVerifyStatus(res.ok && data.ok ? `${provider} doğrulandı` : `${provider} doğrulanamadı`);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/40">
      <h3 className="font-semibold">AI Assistant</h3>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <label className="text-xs text-slate-400">Provider</label>
        <div className="flex gap-2">
          <button
            className={`rounded-md px-2 py-1 text-xs ${provider === "openrouter" ? "bg-violet-600 text-white" : "bg-slate-800"}`}
            onClick={() => {
              setProvider("openrouter");
              setModel(PROVIDER_MODELS.openrouter[0]);
            }}
          >
            OpenRouter
          </button>
          <button
            className={`rounded-md px-2 py-1 text-xs ${provider === "gemini" ? "bg-violet-600 text-white" : "bg-slate-800"}`}
            onClick={() => {
              setProvider("gemini");
              setModel(PROVIDER_MODELS.gemini[0]);
            }}
          >
            Gemini
          </button>
          <button className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500" onClick={() => void verifyCurrentProvider()}>
            Verify
          </button>
        </div>

        <label className="text-xs text-slate-400">Model</label>
        <select
          className="rounded-lg border border-slate-700 bg-slate-950/70 p-2 text-sm outline-none transition focus:border-violet-400"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        >
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="text-xs text-slate-400">API Key</label>
        <input
          type="password"
          className="rounded-lg border border-slate-700 bg-slate-950/70 p-2 text-sm outline-none transition focus:border-violet-400"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder={provider === "openrouter" ? "sk-or-v1-..." : "AIza..."}
        />
        <p className="text-xs text-slate-400">{verifyStatus}</p>
      </div>

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
