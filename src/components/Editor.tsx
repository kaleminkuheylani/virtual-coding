"use client";

import MonacoEditor from "@monaco-editor/react";

const DEFAULT_LANGUAGE = "markdown";

export function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="rounded-xl border p-3">
      <h3 className="font-semibold">Editor</h3>
      <div className="mt-2 overflow-hidden rounded border">
        <MonacoEditor
          height="24rem"
          defaultLanguage={DEFAULT_LANGUAGE}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          theme="vs-light"
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
