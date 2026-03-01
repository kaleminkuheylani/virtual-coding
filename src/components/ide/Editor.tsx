"use client";

import { useEffect, useRef, useCallback } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

export type EditorTheme = "vs-dark" | "hc-black" | "light";
export type EditorFontStyle = "normal" | "italic";

export interface EditorPreferences {
  theme: EditorTheme;
  fontSize: number;
  fontFamily: string;
  fontStyle: EditorFontStyle;
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  language: string;
  isDirty: boolean;
  preferences: EditorPreferences;
  height?: string;
}

export function langFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    r: "r",
    sql: "sql",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    md: "markdown",
    mdx: "markdown",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    dockerfile: "dockerfile",
    makefile: "makefile",
    toml: "toml",
    ini: "ini",
    env: "plaintext",
    txt: "plaintext",
  };
  return langMap[ext || ""] || "plaintext";
}

export function CodeEditor({
  value,
  onChange,
  onSave,
  language,
  isDirty,
  preferences,
  height = "20rem",
}: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#020617",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editor.selectionBackground": "#7c3aed55",
        "editor.lineHighlightBackground": "#1e293b",
        "editorCursor.foreground": "#7c3aed",
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Ctrl+S ile kaydet - otomatik kayıt YOK!
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    // Focus editor on mount
    editor.focus();
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange]
  );

  // Update editor options when preferences change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: preferences.fontSize,
        fontFamily: preferences.fontFamily,
        fontStyle: preferences.fontStyle,
      });
    }
  }, [preferences]);

  return (
    <div
      className={`relative h-full w-full rounded-lg border border-slate-800 bg-slate-950 overflow-hidden ${
        isDirty ? "ring-1 ring-amber-500/50" : ""
      }`}
      style={{ minHeight: height }}
    >
      {/* Dirty indicator */}
      {isDirty && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2 py-1 text-xs text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Kaydedilmedi (Ctrl+S)
        </div>
      )}

      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        theme={preferences.theme === "vs-dark" ? "custom-dark" : preferences.theme}
        options={{
          fontSize: preferences.fontSize,
          fontFamily: preferences.fontFamily,
          fontStyle: preferences.fontStyle,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          wrappingStrategy: "advanced",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  );
}
