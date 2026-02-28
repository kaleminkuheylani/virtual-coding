"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AIPanel } from "@/components/AIPanel";
import { Editor } from "@/components/Editor";
import { FileTree } from "@/components/FileTree";
import { PlanBadge } from "@/components/PlanBadge";
import { ProfilePanel } from "@/components/ProfilePanel";
import { usePlan } from "@/hooks/usePlan";

const Terminal = dynamic(() => import("@/components/Terminal").then((mod) => mod.Terminal), { ssr: false });

export default function HomePage() {
  const { plan, setPlan } = usePlan("free");
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState("README.md");
  const [content, setContent] = useState("");
  const [menu, setMenu] = useState<"file" | "view" | "run" | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [runOutput, setRunOutput] = useState("");

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
    const output = await runCommand(command);
    setRunOutput(output || "(çıktı yok)");
    setShowTerminal(true);
  }

  const gridClassName = useMemo(() => {
    if (showFileTree) {
      return "grid gap-4 lg:grid-cols-[240px_1fr_330px]";
    }
    return "grid gap-4 lg:grid-cols-[1fr_330px]";
  }, [showFileTree]);

  return (
    <main className="min-h-screen bg-slate-950  text-slate-100 w-full " onClick={() => setMenu(null)}>
      <header className="mb-4 flex rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Virtual Coding IDE</h1>
            <p className="text-xs text-slate-400">Dark mode geliştirme alanı</p>
          </div>
          
        </div>

        <div className="relative mt-1 ml-3 flex gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "file" ? null : "file")}>File</button>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "view" ? null : "view")}>View</button>
          <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-500" onClick={() => setMenu(menu === "run" ? null : "run")}>Run</button>

          {menu && (
            <div className="absolute top-11 z-10 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-slate-950/60">
              {menu === "file" && (
                <div className="space-y-1">
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void saveFile()}>Kaydet</button>
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void loadFiles()}>Dosyaları Yenile</button>
                </div>
              )}

              {menu === "view" && (
                <div className="space-y-1">
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowFileTree((value) => !value)}>
                    File Explorer <span>{showFileTree ? "Açık" : "Kapalı"}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowAIPanel((value) => !value)}>
                    AI Panel <span>{showAIPanel ? "Açık" : "Kapalı"}</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => setShowTerminal((value) => !value)}>
                    Terminal <span>{showTerminal ? "Açık" : "Kapalı"}</span>
                  </button>
                </div>
              )}

              {menu === "run" && (
                <div className="space-y-1">
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void runQuickCommand("bun run typecheck")}>Typecheck Çalıştır</button>
                  <button className="w-full rounded-md px-2 py-1.5 text-left hover:bg-slate-800" onClick={() => void runQuickCommand("bun run lint")}>Lint Çalıştır</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      

      <div className={gridClassName}>
        {showFileTree && <FileTree files={files} currentFile={currentFile} onOpen={setCurrentFile} />}

        <div className="space-y-4">
          <Editor value={content} onChange={setContent} />
          {showTerminal && <Terminal onRun={runCommand} />}
        </div>

        <div className="space-y-4">
          <ProfilePanel current={plan} onSelect={setPlan} />
          {showAIPanel && <AIPanel plan={plan} />}
        </div>
      </div>
    </main>
  );
}
