"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AIPanel } from "@/components/AIPanel";
import { Editor, langFromPath, type EditorFontStyle, type EditorPreferences, type EditorTheme } from "@/components/Editor";
import { FileExplorer } from "@/components/fileExplorer";
import { ProfilePanel } from "@/components/ProfilePanel";
import { DeployPanel } from "@/components/DeployPanel";
import { LoginScreen } from "@/components/LoginScreen";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";

const Terminal = dynamic(() => import("@/components/Terminal").then((mod) => mod.Terminal), { ssr: false });

export default function HomePage() {
  const { user, loading, signIn, signUp, signOut, continueAsDemo } = useAuth();
  const { plan, setPlan } = usePlan("free");
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState("README.md");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menu, setMenu] = useState<"file" | "view" | "run" | "deploy" | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalExpanded, setTerminalExpanded] = useState(true);
  const [editorPreferences, setEditorPreferences] = useState<EditorPreferences>({
    theme: "vs-dark",
    fontSize: 13,
    fontFamily: "JetBrains Mono, Fira Code, Menlo, Monaco, monospace",
    fontStyle: "normal",
  });

  async function loadFiles() {
    const response = await fetch("/api/files");
    const data = await response.json();
    setFiles(data.entries ?? []);
  }

  useEffect(() => {
    if (user) void loadFiles();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsDirty(false);
    void fetch(`/api/files?type=file&path=${encodeURIComponent(currentFile)}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content ?? ""));
  }, [currentFile, user]);

  const saveFile = useCallback(async (contentToSave = content) => {
    await fetch("/api/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", path: currentFile, content: contentToSave }),
    });
    setIsDirty(false);
  }, [currentFile, content]);

  const handleContentChange = useCallback((next: string) => {
    setContent(next);
    setIsDirty(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => void saveFile(next), 1500);
  }, [saveFile]);

  async function createFile(path: string) {
    await fetch("/api/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", path, content: "" }),
    });
    await loadFiles();
  }

  function updateTheme(theme: EditorTheme) {
    setEditorPreferences((current) => ({ ...current, theme }));
  }

  function updateFontStyle(fontStyle: EditorFontStyle) {
    setEditorPreferences((current) => ({ ...current, fontStyle }));
  }

  function updateFontSize(fontSize: number) {
    setEditorPreferences((current) => ({ ...current, fontSize }));
  }

  function updateFontFamily(fontFamily: string) {
    setEditorPreferences((current) => ({ ...current, fontFamily }));
  }

  const gridClassName = useMemo(() => {
    if (showFileTree) {
      return "grid gap-2 lg:grid-cols-[230px_minmax(0,1fr)_340px]";
    }
    return "grid gap-2 lg:grid-cols-[minmax(0,1fr)_340px]";
  }, [showFileTree]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} onDemo={continueAsDemo} />;
  }

  return (
    <main
      className="flex h-screen flex-col overflow-hidden bg-[#020617] text-slate-100"
      onClick={() => setMenu(null)}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-800/80 bg-slate-900/80 px-3 py-2 shadow-sm shadow-slate-950/40 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 ring-1 ring-violet-500/20">
            <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-200">Virtual IDE</span>
        </div>

        {/* Menu bar */}
        <div className="relative flex items-center gap-0.5 text-sm" onClick={(e) => e.stopPropagation()}>
          {(["File", "View", "Run", "Deploy"] as const).map((item) => {
            const key = item.toLowerCase() as typeof menu;
            return (
              <button
                key={item}
                onClick={() => setMenu(menu === key ? null : key)}
                className={`rounded-md px-2.5 py-1 text-xs transition ${
                  menu === key
                    ? "bg-slate-700 text-slate-100"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {item}
              </button>
            );
          })}

          {menu && (
            <div
              className={`absolute left-0 top-8 z-50 rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl shadow-slate-950/70 backdrop-blur-sm ${
                menu === "deploy" ? "w-[380px]" : "w-56"
              }`}
            >
              {menu === "file" && (
                <div className="space-y-0.5">
                  <MenuButton onClick={() => void saveFile()}>Kaydet <Kbd>⌘S</Kbd></MenuButton>
                  <MenuButton onClick={() => void loadFiles()}>Dosyaları Yenile</MenuButton>
                </div>
              )}

              {menu === "view" && (
                <div className="space-y-2 p-1">
                  {/* Theme */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tema</p>
                    <div className="grid grid-cols-2 gap-1">
                      <ToggleButton active={editorPreferences.theme === "vs-dark"} onClick={() => updateTheme("vs-dark")}>Dark</ToggleButton>
                      <ToggleButton active={editorPreferences.theme === "hc-black"} onClick={() => updateTheme("hc-black")}>High Contrast</ToggleButton>
                    </div>
                  </div>
                  {/* Font */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Font</p>
                    <select
                      value={editorPreferences.fontFamily}
                      onChange={(e) => updateFontFamily(e.target.value)}
                      className="mb-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200"
                    >
                      <option value="JetBrains Mono, Fira Code, Menlo, Monaco, monospace">JetBrains Mono</option>
                      <option value="Fira Code, Menlo, Monaco, monospace">Fira Code</option>
                      <option value="Consolas, Menlo, Monaco, monospace">Consolas</option>
                    </select>
                    <div className="mb-1.5 grid grid-cols-2 gap-1">
                      <ToggleButton active={editorPreferences.fontStyle === "normal"} onClick={() => updateFontStyle("normal")}>Normal</ToggleButton>
                      <ToggleButton active={editorPreferences.fontStyle === "italic"} onClick={() => updateFontStyle("italic")}>Italic</ToggleButton>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] text-slate-400">Boyut</label>
                      <span className="text-[11px] text-violet-400">{editorPreferences.fontSize}px</span>
                    </div>
                    <input type="range" min={11} max={20} value={editorPreferences.fontSize} onChange={(e) => updateFontSize(Number(e.target.value))} className="w-full accent-violet-500" />
                  </div>
                  {/* Panels */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Paneller</p>
                    <ViewToggle label="Dosya Gezgini" active={showFileTree} onToggle={() => setShowFileTree((v) => !v)} />
                    <ViewToggle label="AI Panel" active={showAIPanel} onToggle={() => setShowAIPanel((v) => !v)} />
                    <ViewToggle label="Terminal" active={showTerminal} onToggle={() => setShowTerminal((v) => !v)} />
                    <ViewToggle label="Geniş Terminal" active={terminalExpanded} onToggle={() => setTerminalExpanded((v) => !v)} />
                  </div>
                </div>
              )}

              {menu === "run" && (
                <div className="p-1">
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hızlı Komutlar</p>
                  <p className="px-2 text-xs text-slate-400">Terminale yazın:</p>
                  <p className="mt-1 rounded-lg bg-slate-800 px-2 py-1 font-mono text-xs text-violet-300">bun run typecheck</p>
                  <p className="mt-1 rounded-lg bg-slate-800 px-2 py-1 font-mono text-xs text-violet-300">bun run lint</p>
                </div>
              )}

              {menu === "deploy" && (
                <div className="max-h-[70vh] overflow-auto">
                  <DeployPanel compact />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current file pill */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 sm:flex">
          <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="max-w-[120px] truncate text-xs text-slate-400">{currentFile}</span>
          {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Kaydedilmemiş değişiklikler" />}
        </div>

        {/* Save button */}
        <button
          onClick={() => void saveFile()}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100 sm:flex"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Kaydet
        </button>

        {/* User avatar */}
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/20">
          {user.email.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5">
        <div className={`${gridClassName} min-h-0`}>
          {showFileTree && (
            <FileExplorer
              files={files}
              currentFile={currentFile}
              onOpen={setCurrentFile}
              onCreateFile={createFile}
            />
          )}

          <div className="min-h-0">
            <Editor
              value={content}
              onChange={handleContentChange}
              onSave={() => void saveFile()}
              language={langFromPath(currentFile)}
              isDirty={isDirty}
              preferences={editorPreferences}
              height="20rem"
            />
          </div>

          <div className="space-y-2">
            <ProfilePanel current={plan} onSelect={setPlan} user={user} onSignOut={() => void signOut()} />
            {showAIPanel && <AIPanel plan={plan} />}
          </div>
        </div>

        {showTerminal && (
          <Terminal
            expanded={terminalExpanded}
            onToggleExpanded={() => setTerminalExpanded((v) => !v)}
          />
        )}
      </div>

      {/* ── Status bar ──────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-800/60 bg-violet-950/20 px-3 py-0.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </span>
          <span className="hidden sm:inline">{currentFile}</span>
        </div>
        <div className="flex items-center gap-3">
          {user.isDemo && <span className="text-amber-600/80">Demo Mod</span>}
          <span>Railway · WebSocket PTY</span>
        </div>
      </div>
    </main>
  );
}

// ── Small helper components ──────────────────────────────────────

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-slate-700 px-1 py-0.5 text-[10px] text-slate-400">{children}</kbd>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-2 py-1.5 text-xs transition ${
        active
          ? "bg-violet-600 text-white"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ViewToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
    >
      <span>{label}</span>
      <span className={`text-[10px] font-medium ${active ? "text-green-400" : "text-slate-600"}`}>
        {active ? "Açık" : "Kapalı"}
      </span>
    </button>
  );
}
