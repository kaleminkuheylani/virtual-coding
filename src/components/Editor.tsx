"use client";

import MonacoEditor from "@monaco-editor/react";

const DEFAULT_LANGUAGE = "markdown";

export type EditorTheme = "vs-dark" | "hc-black";
export type EditorFontStyle = "normal" | "italic";

export type EditorPreferences = {
  theme: EditorTheme;
  fontSize: number;
  fontFamily: string;
  fontStyle: EditorFontStyle;
};

export function Editor({
  value,
  onChange,
  preferences,
  height = "24rem",
}: {
  value: string;
  onChange: (value: string) => void;
  preferences: EditorPreferences;
  height?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-lg shadow-slate-950/30">
      <h3 className="font-semibold">Editor</h3>
      <div className="mt-2 overflow-hidden rounded-lg border border-slate-700">
        <MonacoEditor
          height={height}
          defaultLanguage={DEFAULT_LANGUAGE}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          theme={preferences.theme}
          options={{
            minimap: { enabled: false },
            fontSize: preferences.fontSize,
            fontFamily: preferences.fontFamily,
            fontLigatures: preferences.fontStyle === "italic",
            fontWeight: preferences.fontStyle === "italic" ? "600" : "400",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              comments: true,
              strings: true,
              other: true,
            },
            inlineSuggest: {
              enabled: true,
            },
            wordBasedSuggestions: "currentDocument",
            parameterHints: {
              enabled: true,
            },
          }}
        />
      </div>
    </section>
  );
}
