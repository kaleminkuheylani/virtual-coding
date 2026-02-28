"use client";

import { useState } from "react";

type Props = {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
  onDemo: () => void;
};

export function LoginScreen({ onSignIn, onSignUp, onDemo }: Props) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const err =
      tab === "signin"
        ? await onSignIn(email, password)
        : await onSignUp(email, password);
    if (err) {
      setError(err);
    } else if (tab === "signup") {
      setSuccess("Hesap oluşturuldu! E-postanı kontrol et.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#020617]">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-violet-950/60 blur-[140px]" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-950/50 blur-[120px]" />
      </div>

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo + brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 shadow-lg shadow-violet-950/40 ring-1 ring-inset ring-violet-400/10">
            <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Virtual Coding IDE</h1>
          <p className="mt-1.5 text-sm text-slate-500">Bulut tabanlı geliştirme ortamı</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur-sm">
          {/* Tab switcher */}
          <div className="mb-5 flex rounded-xl border border-slate-700/50 bg-slate-800/60 p-1">
            <button
              type="button"
              onClick={() => { setTab("signin"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
                tab === "signin"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
                tab === "signup"
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                E-posta adresi
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Şifre
              </label>
              <input
                type="password"
                required
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-3 py-2.5">
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-800/40 bg-green-950/30 px-3 py-2.5">
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-green-300">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-900/40 transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  İşleniyor...
                </span>
              ) : tab === "signin" ? "Giriş Yap" : "Hesap Oluştur"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-700/50" />
            <span className="text-xs text-slate-600">veya</span>
            <div className="h-px flex-1 bg-slate-700/50" />
          </div>

          <button
            type="button"
            onClick={onDemo}
            className="group w-full rounded-xl border border-slate-700/80 bg-slate-800/40 py-2.5 text-sm font-medium text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Demo olarak devam et
            </span>
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-700">
          Railway · WebSocket PTY · Monaco Editor
        </p>
      </div>
    </div>
  );
}
