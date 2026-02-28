"use client";

import { useMemo, useState } from "react";

type FileExplorerProps = {
  files: string[];
  currentFile: string;
  onOpen: (path: string) => void;
  onCreateFile: (path: string) => Promise<void>;
};

const FILE_ICONS: Record<string, string> = {
  ts: "🟦",
  tsx: "⚛️",
  js: "🟨",
  jsx: "🟨",
  py: "🐍",
  md: "📝",
  json: "🧩",
  css: "🎨",
  scss: "🎨",
  html: "🌐",
  htm: "🌐",
  yml: "⚙️",
  yaml: "⚙️",
  sh: "🖥️",
};

function getFileIcon(path: string) {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[extension] ?? "📄";
}

export function FileExplorer({ files, currentFile, onOpen, onCreateFile }: FileExplorerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameWithExtension, setNameWithExtension] = useState("");
  const [error, setError] = useState("");

  const sortedFiles = useMemo(() => [...files].sort((a, b) => a.localeCompare(b)), [files]);

  async function handleCreate() {
    const fileName = nameWithExtension.trim().replace(/^\.+/, "");

    if (!fileName) {
      setError("Dosya adı girmeniz gerekiyor. Örn: main.py");
      return;
    }

    if (!fileName.includes(".")) {
      setError("Uzantı ekleyin. Örn: main.py");
      return;
    }

    await onCreateFile(fileName);
    onOpen(fileName);
    setNameWithExtension("");
    setError("");
    setIsModalOpen(false);
  }

  return (
    <aside className="relative rounded-2xl border border-slate-800 bg-[#111827]/90 p-3 shadow-lg shadow-slate-950/40">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold tracking-wide text-slate-200">Explorer</h3>
        <button
          className="rounded-md border border-slate-700 bg-slate-800/90 px-2 py-1 text-xs text-slate-100 hover:border-violet-400"
          onClick={() => setIsModalOpen(true)}
        >
          + Dosya
        </button>
      </div>

      <ul className="space-y-1 text-sm">
        {sortedFiles.map((file) => (
          <li key={file}>
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition ${
                file === currentFile
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
              onClick={() => onOpen(file)}
            >
              <span>{getFileIcon(file)}</span>
              <span className="truncate">{file}</span>
            </button>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-950/80 p-3">
          <div className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/40">
            <h4 className="text-sm font-semibold">Yeni dosya oluştur</h4>
            <p className="mt-1 text-xs text-slate-400">Dosya adını uzantısıyla girin. Örn: main.py</p>

            <div className="mt-3 space-y-2">
              <input
                value={nameWithExtension}
                onChange={(event) => {
                  setNameWithExtension(event.target.value);
                  setError("");
                }}
                placeholder="ör: main.py"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm outline-none focus:border-violet-400"
              />
            </div>

            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

            <div className="mt-3 flex justify-end gap-2">
              <button
                className="rounded-md border border-slate-700 px-2.5 py-1 text-xs hover:bg-slate-800"
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                }}
              >
                Vazgeç
              </button>
              <button className="rounded-md bg-violet-600 px-2.5 py-1 text-xs hover:bg-violet-500" onClick={() => void handleCreate()}>
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
