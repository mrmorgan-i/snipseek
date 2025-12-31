"use client";

import { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
  maxLines?: number;
};

// map our language names to Monaco language IDs
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  go: "go",
  rust: "rust",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  r: "r",
  sql: "sql",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  bash: "shell",
  shell: "shell",
  powershell: "powershell",
  dockerfile: "dockerfile",
  graphql: "graphql",
  prisma: "prisma",
  toml: "ini",
  xml: "xml",
  plaintext: "plaintext",
};

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "400px",
  maxLines,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const monacoLanguage = languageMap[language] ?? "plaintext";

  // calculate height based on lines if we pass in maxLines
  const calculatedHeight = maxLines
    ? `${Math.min(value.split("\n").length, maxLines) * 19 + 20}px`
    : height;

  return (
    <div className="rounded-md border overflow-hidden">
      <Editor
        height={calculatedHeight}
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: readOnly ? "off" : "on",
          folding: !readOnly,
          lineDecorationsWidth: readOnly ? 0 : 10,
          lineNumbersMinChars: readOnly ? 0 : 3,
          glyphMargin: false,
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            vertical: readOnly ? "hidden" : "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          renderLineHighlight: readOnly ? "none" : "line",
          contextmenu: !readOnly,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
