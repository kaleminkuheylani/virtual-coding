"use client";

import { useEffect, useState } from "react";
import { AIPanel } from "@/components/AIPanel";
import { Editor } from "@/components/Editor";
import { FileTree } from "@/components/FileTree";
import { PlanBadge } from "@/components/PlanBadge";
import { PricingModal } from "@/components/PricingModal";
import { Terminal } from "@/components/Terminal";
import { usePlan } from "@/hooks/usePlan";

export default function HomePage() {
  const { plan, setPlan } = usePlan("free");
  const [files, setFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState("README.md");
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/files")
      .then((r) => r.json())
      .then((data) => setFiles(data.entries ?? []));
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

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900">
      <header className="mb-4 flex items-center justify-between rounded-xl border bg-white p-3">
        <h1 className="text-xl font-bold">Virtual Coding IDE</h1>
        <div className="flex items-center gap-2">
          <PlanBadge plan={plan} />
          <button onClick={saveFile} className="rounded border px-3 py-1">Save (Ctrl+S)</button>
        </div>
      </header>

      <div className="mb-4">
        <PricingModal current={plan} onSelect={setPlan} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr_360px]">
        <FileTree files={files} currentFile={currentFile} onOpen={setCurrentFile} />
        <div className="space-y-4">
          <Editor value={content} onChange={setContent} />
          <Terminal onRun={runCommand} />
        </div>
        <AIPanel plan={plan} />
      </div>
    </main>
  );
}
