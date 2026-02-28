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
    <aside className="rounded-xl border p-3">
      <h3 className="font-semibold">Files</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {files.map((file) => (
          <li key={file}>
            <button
              className={`w-full rounded px-2 py-1 text-left ${file === currentFile ? "bg-blue-100" : "hover:bg-gray-100"}`}
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
