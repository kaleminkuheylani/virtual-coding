"use client";

export function FileTree({
  files,
  currentFile,
  onOpen,
}: {
  files: string[];
  currentFile: string;
  onOpen: (path: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
      <h3 className="font-semibold">Files</h3>
      <ul className="mt-3 space-y-1 text-sm">
        {files.map((file) => (
          <li key={file}>
            <button
              className={`w-full rounded-lg px-2 py-1.5 text-left transition ${
                file === currentFile
                  ? "bg-violet-500/15 text-violet-200"
                  : "hover:bg-slate-800"
              }`}
              onClick={() => onOpen(file)}
            >
              {file}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
