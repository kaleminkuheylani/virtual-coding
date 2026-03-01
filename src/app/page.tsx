"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { CodeEditor, langFromPath, type EditorPreferences } from "@/components/ide/Editor";
import { FileExplorer } from "@/components/ide/FileExplorer";
import { AIPanel } from "@/components/ide/AIPanel";
import { ProfilePanel } from "@/components/ide/ProfilePanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Terminal = dynamic(
  () => import("@/components/ide/Terminal").then((mod) => mod.Terminal),
  { ssr: false }
);

type PlanType = "free" | "starter" | "pro";
type MenuType = "file" | "view" | "run" | null;

// Demo files
const DEMO_FILES = [
  "README.md",
  "src/index.ts",
  "src/components/App.tsx",
  "src/components/Button.tsx",
  "src/hooks/useAuth.ts",
  "src/lib/utils.ts",
  "src/styles/globals.css",
  "package.json",
  "tsconfig.json",
];

const DEMO_CONTENT: Record<string, string> = {
  "README.md": `# Virtual IDE

Hos geldiniz! Bu bir sanal kod editörudur.

## Ozellikler

- Monaco Editor ile gercek zamanli duzenleme
- Terminal destegi
- AI asistani
- Dosya gezgini

## Kullanim

- \`Ctrl+S\` ile kaydedin
- Terminalde komut calistirin
- AI asistana sorular sorun
`,
  "src/index.ts": `// Ana giris noktasi
import { App } from "./components/App";

console.log("Virtual IDE baslatiliyor...");

const app = new App({
  theme: "dark",
  language: "typescript",
});

app.start();
`,
  "src/components/App.tsx": `import { useState } from "react";
import { Button } from "./Button";

interface AppProps {
  theme: "dark" | "light";
  language: string;
}

export function App({ theme, language }: AppProps) {
  const [count, setCount] = useState(0);

  return (
    <div className={\`app \${theme}\`}>
      <h1>Virtual IDE</h1>
      <Button onClick={() => setCount(c => c + 1)}>
        Tiklama: {count}
      </Button>
    </div>
  );
}
`,
  "src/components/Button.tsx": `interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  onClick,
  variant = "primary"
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}
`,
  "src/hooks/useAuth.ts": `import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    setTimeout(() => {
      setUser({
        id: "1",
        email: "demo@virtual-ide.dev",
        name: "Demo User"
      });
      setLoading(false);
    }, 500);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Sign in logic
  };

  const signOut = async () => {
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
`,
  "src/lib/utils.ts": `// Yardimci fonksiyonlar

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
`,
  "src/styles/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #020617;
  --foreground: #e2e8f0;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, sans-serif;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #7c3aed;
  color: white;
}

.btn-primary:hover {
  background: #6d28d9;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}
`,
  "package.json": `{
  "name": "virtual-ide-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`,
};

export default function HomePage() {
  const [plan, setPlan] = useState<PlanType>("free");
  const [files, setFiles] = useState<string[]>(DEMO_FILES);
  const [currentFile, setCurrentFile] = useState("README.md");
  const [content, setContent] = useState(DEMO_CONTENT["README.md"] || "");
  const [savedContent, setSavedContent] = useState(DEMO_CONTENT["README.md"] || "");
  const [menu, setMenu] = useState<MenuType>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalExpanded, setTerminalExpanded] = useState(true);
  const [editorPreferences, setEditorPreferences] = useState<EditorPreferences>({
    theme: "vs-dark",
    fontSize: 13,
    fontFamily: "JetBrains Mono, Fira Code, Menlo, Monaco, monospace",
    fontStyle: "normal",
  });

  // File content storage (simulated)
  const [fileStorage, setFileStorage] = useState<Record<string, string>>(DEMO_CONTENT);

  // Check if file is dirty (unsaved)
  const isDirty = content !== savedContent;

  // Handle file open - load content
  const handleOpenFile = useCallback((path: string) => {
    // Save current file content before switching
    if (isDirty) {
      setFileStorage(prev => ({ ...prev, [currentFile]: content }));
    }
    
    // Load new file - use callback to get latest state
    setFileStorage(prev => {
      const fileContent = prev[path] ?? "";
      setContent(fileContent);
      setSavedContent(fileContent);
      return prev;
    });
    setCurrentFile(path);
  }, [currentFile, content, isDirty]);

  // Save file - ONLY triggered by Ctrl+S
  const saveFile = useCallback(() => {
    setFileStorage(prev => ({ ...prev, [currentFile]: content }));
    setSavedContent(content);
    console.log(`Saved: ${currentFile}`);
  }, [currentFile, content]);

  // Handle content change - NO AUTO-SAVE
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    // NOT calling saveFile here - no auto-save!
  }, []);

  // Create new file
  const createFile = useCallback((path: string) => {
    if (!files.includes(path)) {
      setFiles((prev) => [...prev, path]);
      setFileStorage(prev => ({ ...prev, [path]: "" }));
    }
    setCurrentFile(path);
  }, [files]);

  // Update editor preferences
  const updateTheme = (theme: EditorPreferences["theme"]) => {
    setEditorPreferences((prev) => ({ ...prev, theme }));
  };

  const updateFontSize = (fontSize: number) => {
    setEditorPreferences((prev) => ({ ...prev, fontSize }));
  };

  const updateFontFamily = (fontFamily: string) => {
    setEditorPreferences((prev) => ({ ...prev, fontFamily }));
  };

  return (
    <main
      className="flex h-screen flex-col overflow-hidden bg-[#020617] text-slate-100"
      onClick={() => setMenu(null)}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-800/80 bg-slate-900/80 px-3 py-2 shadow-sm shadow-slate-950/40 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 ring-1 ring-violet-500/20">
            <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-200">Virtual IDE</span>
        </div>

        {/* Menu bar - FIXED Z-INDEX */}
        <div className="relative flex items-center gap-0.5 text-sm" onClick={(e) => e.stopPropagation()}>
          {(["File", "View", "Run"] as const).map((item) => {
            const key = item.toLowerCase() as MenuType;
            return (
              <button
                key={item}
                onClick={() => setMenu(menu === key ? null : key)}
                className={`rounded-md px-2.5 py-1 text-xs transition ${
                  menu === key
                    ? "bg-slate-700 text-slate-100"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {item}
              </button>
            );
          })}

          {/* Dropdown menu - HIGH Z-INDEX */}
          {menu && (
            <div className="absolute left-0 top-full mt-1 z-[100] rounded-xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl shadow-slate-950/70 backdrop-blur-sm w-56">
              {menu === "file" && (
                <div className="space-y-0.5">
                  <MenuButton onClick={() => saveFile()}>
                    Kaydet <Kbd>Ctrl+S</Kbd>
                  </MenuButton>
                  <MenuButton onClick={() => createFile(`new-file-${Date.now()}.ts`)}>
                    Yeni Dosya
                  </MenuButton>
                </div>
              )}

              {menu === "view" && (
                <div className="space-y-2 p-1">
                  {/* Theme */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tema</p>
                    <div className="grid grid-cols-2 gap-1">
                      <ToggleButton active={editorPreferences.theme === "vs-dark"} onClick={() => updateTheme("vs-dark")}>
                        Dark
                      </ToggleButton>
                      <ToggleButton active={editorPreferences.theme === "hc-black"} onClick={() => updateTheme("hc-black")}>
                        High Contrast
                      </ToggleButton>
                    </div>
                  </div>
                  {/* Font */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Font</p>
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] text-slate-400">Boyut</label>
                      <span className="text-[11px] text-violet-400">{editorPreferences.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={11}
                      max={20}
                      value={editorPreferences.fontSize}
                      onChange={(e) => updateFontSize(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                  {/* Panels */}
                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Paneller</p>
                    <ViewToggle label="Dosya Gezgini" active={showFileTree} onToggle={() => setShowFileTree((v) => !v)} />
                    <ViewToggle label="AI Panel" active={showAIPanel} onToggle={() => setShowAIPanel((v) => !v)} />
                    <ViewToggle label="Terminal" active={showTerminal} onToggle={() => setShowTerminal((v) => !v)} />
                  </div>
                </div>
              )}

              {menu === "run" && (
                <div className="p-1">
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hizli Komutlar</p>
                  <p className="px-2 text-xs text-slate-400">Terminale yazin:</p>
                  <p className="mt-1 rounded-lg bg-slate-800 px-2 py-1 font-mono text-xs text-violet-300">bun run dev</p>
                  <p className="mt-1 rounded-lg bg-slate-800 px-2 py-1 font-mono text-xs text-violet-300">bun run lint</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current file pill */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 sm:flex">
          <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className="max-w-[120px] truncate text-xs text-slate-400">{currentFile}</span>
          {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" title="Kaydedilmemis degisiklikler" />}
        </div>

        {/* Save button */}
        <button
          onClick={() => saveFile()}
          disabled={!isDirty}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:opacity-50 sm:flex"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Kaydet
        </button>

        {/* User avatar */}
        <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-xs font-semibold text-violet-300 ring-1 ring-violet-500/20">
          D
        </div>
      </header>

      {/* Main content with Resizable Panels */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* File Explorer Panel */}
          {showFileTree && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
                <FileExplorer
                  files={files}
                  currentFile={currentFile}
                  onOpen={handleOpenFile}
                  onCreateFile={createFile}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Editor Panel */}
          <ResizablePanel defaultSize={showAIPanel ? 55 : 85} minSize={30}>
            <CodeEditor
              value={content}
              onChange={handleContentChange}
              onSave={saveFile}
              language={langFromPath(currentFile)}
              isDirty={isDirty}
              preferences={editorPreferences}
              height="100%"
            />
          </ResizablePanel>

          {/* Right Panel (AI + Profile) - RESIZABLE */}
          {showAIPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <div className="flex h-full flex-col gap-2 p-1">
                  <ProfilePanel current={plan} onSelect={setPlan} />
                  <div className="flex-1 min-h-0">
                    <AIPanel plan={plan} />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* Terminal */}
        {showTerminal && (
          <Terminal
            expanded={terminalExpanded}
            onToggleExpanded={() => setTerminalExpanded((v) => !v)}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-800/60 bg-violet-950/20 px-3 py-0.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${
              plan === "pro" ? "bg-violet-500" : plan === "starter" ? "bg-blue-500" : "bg-slate-500"
            }`} />
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </span>
          <span className="hidden sm:inline">{currentFile}</span>
          {isDirty && <span className="text-amber-400">Kaydedilmedi</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-violet-400">Ctrl+S ile kaydet</span>
        </div>
      </div>
    </main>
  );
}

// Helper components
function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-slate-700 px-1 py-0.5 text-[10px] text-slate-400">{children}</kbd>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-2 py-1.5 text-xs transition ${
        active
          ? "bg-violet-600 text-white"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ViewToggle({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
    >
      <span>{label}</span>
      <span className={`text-[10px] font-medium ${active ? "text-green-400" : "text-slate-600"}`}>
        {active ? "Acik" : "Kapali"}
      </span>
    </button>
  );
}
