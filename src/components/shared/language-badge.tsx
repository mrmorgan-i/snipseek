import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@/lib/validation";

const languageColors: Partial<Record<SupportedLanguage, string>> = {
  javascript: "bg-amber/20 text-amber",
  typescript: "bg-cyan/20 text-cyan",
  python: "bg-emerald/20 text-emerald",
  go: "bg-cyan/20 text-cyan",
  rust: "bg-amber/20 text-amber",
  java: "bg-amber/20 text-amber",
  c: "bg-violet/20 text-violet",
  cpp: "bg-violet/20 text-violet",
  csharp: "bg-violet/20 text-violet",
  php: "bg-violet/20 text-violet",
  ruby: "bg-destructive/20 text-destructive",
  swift: "bg-amber/20 text-amber",
  kotlin: "bg-violet/20 text-violet",
  sql: "bg-cyan/20 text-cyan",
  html: "bg-amber/20 text-amber",
  css: "bg-cyan/20 text-cyan",
  json: "bg-muted-foreground/20 text-muted-foreground",
  yaml: "bg-emerald/20 text-emerald",
  bash: "bg-emerald/20 text-emerald",
  shell: "bg-emerald/20 text-emerald",
  dockerfile: "bg-cyan/20 text-cyan",
  graphql: "bg-violet/20 text-violet",
};

type LanguageBadgeProps = {
  language: string;
  className?: string;
};

export function LanguageBadge({ language, className }: LanguageBadgeProps) {
  const colorClass =
    languageColors[language as SupportedLanguage] ??
    "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        colorClass,
        className
      )}
    >
      {language}
    </span>
  );
}
