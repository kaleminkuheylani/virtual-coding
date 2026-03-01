"use client";

import { useState } from "react";

interface FileExplorerProps {
  files: string[];
  currentFile: string;
  onOpen: (path: string) => void;
  onCreateFile: (path: string) => void;
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  path: string;
}

function buildFileTree(files: string[]): FileNode[] {
  const root: FileNode[] = [];

  files.forEach((file) => {
    const parts = file.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existing = current.find((n) => n.name === part);

      if (existing) {
        if (!isFile && existing.children) {
          current = existing.children;
        }
      } else {
        const node: FileNode = {
          name: part,
          type: isFile ? "file" : "folder",
          path: parts.slice(0, index + 1).join("/"),
          children: isFile ? undefined : [],
        };
        current.push(node);
        if (!isFile && node.children) {
          current = node.children;
        }
      }
    });
  });

  return root.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "folder" ? -1 : 1;
  });
}

function getFileIcon(filename: string): { icon: string; color: string } {
  const ext = filename.split(".").pop()?.toLowerCase();

  const icons: Record<string, { icon: string; color: string }> = {
    ts: { icon: "TS", color: "text-blue-400" },
    tsx: { icon: "TX", color: "text-blue-400" },
    js: { icon: "JS", color: "text-yellow-400" },
    jsx: { icon: "JX", color: "text-yellow-400" },
    py: { icon: "PY", color: "text-green-400" },
    json: { icon: "{}", color: "text-amber-400" },
    md: { icon: "MD", color: "text-slate-400" },
    css: { icon: "CSS", color: "text-pink-400" },
    html: { icon: "HTML", color: "text-orange-400" },
    svg: { icon: "SVG", color: "text-purple-400" },
  };

  return icons[ext || ""] || { icon: "F", color: "text-slate-400" };
}

function TreeNode({
  node,
  currentFile,
  onOpen,
  depth = 0,
}: {
  node: FileNode;
  currentFile: string;
  onOpen: (path: string) => void;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isActive = node.path === currentFile;
  const { icon, color } = getFileIcon(node.name);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <svg
            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            className="h-3.5 w-3.5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                currentFile={currentFile}
                onOpen={onOpen}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpen(node.path)}
      className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition ${
        isActive
          ? "bg-violet-600/20 text-violet-300"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <span className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold ${color}`}>
        {icon}
      </span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileExplorer({
  files,
  currentFile,
  onOpen,
  onCreateFile,
}: FileExplorerProps) {
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const fileTree = buildFileTree(files);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName("");
      setShowNewFile(false);
    }
  };

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-slate-200">Dosyalar</h3>
        </div>
        <button
          onClick={() => setShowNewFile(!showNewFile)}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          title="Yeni dosya"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* New file input */}
      {showNewFile && (
        <div className="border-b border-slate-800/50 p-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile();
                if (e.key === "Escape") setShowNewFile(false);
              }}
              placeholder="dosya_adi.ts"
              className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleCreateFile}
              className="rounded-md bg-violet-600 px-2 py-1 text-xs text-white transition hover:bg-violet-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            currentFile={currentFile}
            onOpen={onOpen}
          />
        ))}
      </div>
    </aside>
  );
}
