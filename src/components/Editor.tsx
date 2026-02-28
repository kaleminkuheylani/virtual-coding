"use client";

import MonacoEditor from "@monaco-editor/react";

const DEFAULT_LANGUAGE = "markdown";

export function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
      <h3 className="font-semibold">Editor</h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-700">
        <MonacoEditor
          height="24rem"
          defaultLanguage={DEFAULT_LANGUAGE}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </section>
  );
}
