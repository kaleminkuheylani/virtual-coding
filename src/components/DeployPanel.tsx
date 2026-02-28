"use client";

import { useState } from "react";

type TokenStatus = "idle" | "checking" | "ok" | "error";

type VerifyResponse = {
  ok?: boolean;
  error?: string;
};

export function DeployPanel({ compact = false }: { compact?: boolean }) {
  const [githubToken, setGithubToken] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [netlifyToken, setNetlifyToken] = useState("");

  const [githubStatus, setGithubStatus] = useState<TokenStatus>("idle");
  const [vercelStatus, setVercelStatus] = useState<TokenStatus>("idle");
  const [netlifyStatus, setNetlifyStatus] = useState<TokenStatus>("idle");

  async function verify(provider: "github" | "vercel" | "netlify", token: string, setStatus: (status: TokenStatus) => void) {
    if (!token.trim()) {
      setStatus("error");
      return;
    }

    setStatus("checking");
    const response = await fetch("/api/deploy/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, token }),
    });

    const data = (await response.json()) as VerifyResponse;
    setStatus(response.ok && data.ok ? "ok" : "error");
  }

  function statusLabel(status: TokenStatus) {
    if (status === "checking") return "Doğrulanıyor...";
    if (status === "ok") return "Doğrulandı";
    if (status === "error") return "Hatalı token";
    return "Bekleniyor";
  }

  function statusClass(status: TokenStatus) {
    if (status === "ok") return "text-emerald-400";
    if (status === "error") return "text-rose-400";
    if (status === "checking") return "text-amber-300";
    return "text-slate-400";
  }

  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-slate-950/40 ${compact ? "p-3" : "p-4"}`}>
      <h3 className="text-base font-semibold">Deploy</h3>
      {!compact && <p className="mt-1 text-xs text-slate-400">GitHub, Vercel ve Netlify tokenlarını girip doğrulayın.</p>}

      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-xs font-medium text-slate-300">GitHub Token</p>
          <input
            type="password"
            value={githubToken}
            onChange={(event) => setGithubToken(event.target.value)}
            placeholder="ghp_..."
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${statusClass(githubStatus)}`}>{statusLabel(githubStatus)}</span>
            <button
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
              onClick={() => void verify("github", githubToken, setGithubStatus)}
            >
              Verify
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-xs font-medium text-slate-300">Vercel Token</p>
          <input
            type="password"
            value={vercelToken}
            onChange={(event) => setVercelToken(event.target.value)}
            placeholder="vercel_..."
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${statusClass(vercelStatus)}`}>{statusLabel(vercelStatus)}</span>
            <button
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
              onClick={() => void verify("vercel", vercelToken, setVercelStatus)}
            >
              Verify
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-xs font-medium text-slate-300">Netlify Token</p>
          <input
            type="password"
            value={netlifyToken}
            onChange={(event) => setNetlifyToken(event.target.value)}
            placeholder="nfp_..."
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-xs ${statusClass(netlifyStatus)}`}>{statusLabel(netlifyStatus)}</span>
            <button
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs hover:border-slate-500"
              onClick={() => void verify("netlify", netlifyToken, setNetlifyStatus)}
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
