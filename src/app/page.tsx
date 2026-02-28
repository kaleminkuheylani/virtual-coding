"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AIPanel } from "@/components/AIPanel";
import { Editor, type EditorFontStyle, type EditorPreferences, type EditorTheme } from "@/components/Editor";
import { FileExplorer } from "@/components/fileExplorer";
import { ProfilePanel } from "@/components/ProfilePanel";
import { DeployPanel } from "@/components/DeployPanel";
import { usePlan } from "@/hooks/usePlan";

const Terminal = dynamic(() => import("@/components/Terminal").then((mod) => mod.Terminal), { ssr: false });

export default function HomePage() {
  const { plan, setPlan } = usePlan("free");
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState("README.md");
  const [content, setContent] = useState("");
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
    void loadFiles();
  }, []);

  useEffect(() => {
    void fetch(`/api/files?type=file&path=${encodeURIComponent(currentFile)}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content ?? ""));
  }, [currentFile]);

  async function saveFile() {
    await fetch("/api/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", path: currentFile, content }),
    });
  }

  async function createFile(path: string) {
    await fetch("/api/files", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "save", path, content: "" }),
    });
    await loadFiles();
  }

  async function runCommand(command: string): Promise<string> {
    const response = await fetch("/api/terminal/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ command, plan }),
    });
    const data = await response.json();
    return `${data.stdout ?? ""}${data.stderr ?? ""}`;
  }

  async function runQuickCommand(command: string) {
    await runCommand(command);
    setShowTerminal(true);
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

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#020617] px-2 pb-2 pt-2 text-slate-100" onClick={() => setMenu(null)}>
      <header className="mb-2 flex rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Virtual Coding IDE</h1>
            <p className="text-xs text-slate-400">Dark mode geliştirme alanı</p>
          </div>
        </div>

        <div className="relative ml-3 mt-1 flex gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "file" ? null : "file")}>File</button>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "view" ? null : "view")}>View</button>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "run" ? null : "run")}>Run</button>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "deploy" ? null : "deploy")}>Deploy</button>

          {menu && (
            <div className={`absolute top-11 z-10 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-slate-950/60 ${menu === "deploy" ? "w-[380px]" : "w-72"}`}>
              {menu === "file" && (
                <div className="space-y-1">
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void saveFile()}>Kaydet</button>
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void loadFiles()}>Dosyaları Yenile</button>
                </div>
              )}

              {menu === "view" && (
                <div className="space-y-1">
                  <div className="rounded-md border border-slate-700 bg-slate-950/70 p-2">
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Editor Theme</p>
                    <div className="grid grid-cols-2 gap-1">
                      <button className={`rounded px-2 py-1 text-xs ${editorPreferences.theme === "vs-dark" ? "bg-violet-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`} onClick={() => updateTheme("vs-dark")}>Dark</button>
                      <button className={`rounded px-2 py-1 text-xs ${editorPreferences.theme === "hc-black" ? "bg-violet-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`} onClick={() => updateTheme("hc-black")}>High Contrast</button>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-700 bg-slate-950/70 p-2">
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Font</p>
                    <select value={editorPreferences.fontFamily} onChange={(event) => updateFontFamily(event.target.value)} className="mb-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs">
                      <option value="JetBrains Mono, Fira Code, Menlo, Monaco, monospace">JetBrains Mono</option>
                      <option value="Fira Code, Menlo, Monaco, monospace">Fira Code</option>
                      <option value="Consolas, Menlo, Monaco, monospace">Consolas</option>
                    </select>
                    <div className="mb-1 grid grid-cols-2 gap-1">
                      <button className={`rounded px-2 py-1 text-xs ${editorPreferences.fontStyle === "normal" ? "bg-violet-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`} onClick={() => updateFontStyle("normal")}>Normal</button>
                      <button className={`rounded px-2 py-1 text-xs ${editorPreferences.fontStyle === "italic" ? "bg-violet-600 text-white" : "bg-slate-800 hover:bg-slate-700"}`} onClick={() => updateFontStyle("italic")}>Italic</button>
                    </div>
                    <label className="text-[11px] text-slate-400">Font Size: {editorPreferences.fontSize}px</label>
                    <input type="range" min={11} max={20} value={editorPreferences.fontSize} onChange={(event) => updateFontSize(Number(event.target.value))} className="w-full accent-violet-500" />
                  </div>

                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowFileTree((value) => !value)}>
                    File Explorer <span>{showFileTree ? "Açık" : "Kapalı"}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowAIPanel((value) => !value)}>
                    AI Panel <span>{showAIPanel ? "Açık" : "Kapalı"}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowTerminal((value) => !value)}>
                    Terminal <span>{showTerminal ? "Açık" : "Kapalı"}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setTerminalExpanded((value) => !value)}>
                    Terminal Boyutu <span>{terminalExpanded ? "Geniş" : "Dar"}</span>
                  </button>
                </div>
              )}

              {menu === "run" && (
                <div className="space-y-1">
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void runQuickCommand("bun run typecheck")}>Typecheck Çalıştır</button>
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void runQuickCommand("bun run lint")}>Lint Çalıştır</button>
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
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className={`${gridClassName} min-h-0`}>
          {showFileTree && <FileExplorer files={files} currentFile={currentFile} onOpen={setCurrentFile} onCreateFile={createFile} />}

          <div className="min-h-0">
            <Editor value={content} onChange={setContent} preferences={editorPreferences} height="20rem" />
          </div>

          <div className="space-y-2">
            <ProfilePanel current={plan} onSelect={setPlan} />
            {showAIPanel && <AIPanel plan={plan} />}
          </div>
        </div>

        {showTerminal && <Terminal onRun={runCommand} expanded={terminalExpanded} onToggleExpanded={() => setTerminalExpanded((value) => !value)} />}
      </div>
    </main>
  );
}
