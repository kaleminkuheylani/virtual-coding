"use client";

import MonacoEditor, { type OnMount } from "@monaco-editor/react";

export type EditorTheme = "vs-dark" | "hc-black";
export type EditorFontStyle = "normal" | "italic";

export type EditorPreferences = {
  theme: EditorTheme;
  fontSize: number;
  fontFamily: string;
  fontStyle: EditorFontStyle;
};

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
  py: "python", rs: "rust", go: "go", java: "java", c: "c", cpp: "cpp",
  cs: "csharp", rb: "ruby", php: "php", swift: "swift", kt: "kotlin",
  json: "json", yaml: "yaml", yml: "yaml", toml: "toml",
  html: "html", htm: "html", css: "css", scss: "scss", less: "less",
  md: "markdown", mdx: "markdown", sh: "shell", bash: "shell",
  sql: "sql", graphql: "graphql", xml: "xml", dockerfile: "dockerfile",
};

export function langFromPath(path: string): string {
  const name = path.split("/").pop() ?? "";
  if (name.toLowerCase() === "dockerfile") return "dockerfile";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_LANG[ext] ?? "plaintext";
}

export function Editor({
  value,
  onChange,
  onSave,
  language,
  isDirty,
  preferences,
  height = "24rem",
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  language: string;
  isDirty: boolean;
  preferences: EditorPreferences;
  height?: string;
}) {
  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });
  };

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/30">
      {/* Editor title bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Editor</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">{language}</span>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1 text-[10px] text-amber-500/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            kaydediliyor…
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-b-xl">
        <MonacoEditor
          height={height}
          language={language}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          onMount={handleMount}
          theme={preferences.theme}
          options={{
            minimap: { enabled: false },
            fontSize: preferences.fontSize,
            fontFamily: preferences.fontFamily,
            fontLigatures: true,
            fontWeight: preferences.fontStyle === "italic" ? "600" : "400",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            suggestOnTriggerCharacters: true,
            quickSuggestions: { comments: true, strings: true, other: true },
            inlineSuggest: { enabled: true },
            wordBasedSuggestions: "currentDocument",
            parameterHints: { enabled: true },
            wordWrap: "on",
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </section>
  );
}
