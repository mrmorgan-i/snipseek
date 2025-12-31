"use client";

import { CodeEditor } from "@/components/shared";

type SnippetCodeViewProps = {
  code: string;
  language: string;
};

export function SnippetCodeView({ code, language }: SnippetCodeViewProps) {
  const lineCount = code.split("\n").length;
  const height = Math.min(Math.max(lineCount * 19 + 20, 150), 600);

  return (
    <div>
      <div className="border-b border-border px-4 py-2 flex items-center justify-between bg-muted/30 rounded-t-md">
        <span className="text-sm text-muted-foreground">
          {lineCount} line{lineCount !== 1 ? "s" : ""}
        </span>
      </div>
      <CodeEditor
        value={code}
        language={language}
        readOnly
        height={`${height}px`}
      />
    </div>
  );
}
