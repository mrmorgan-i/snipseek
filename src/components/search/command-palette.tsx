"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  FileText,
  Loader2,
  ChevronDown,
  FolderOpen,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageBadge } from "@/components/shared/language-badge";
import { searchSnippets } from "@/actions/snippets";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/validation";

type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  language: string;
  collectionName?: string | null;
};

type Collection = {
  id: string;
  name: string;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  collections?: Collection[];
};

export function CommandPalette({
  isOpen,
  onClose,
  collections = [],
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"text" | "semantic">("text");
  const [languageFilter, setLanguageFilter] = useState<SupportedLanguage | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
    setLanguageFilter(null);
    setCollectionFilter(null);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      startTransition(async () => {
        const response = await searchSnippets({
          query: searchQuery,
          mode,
          language: languageFilter,
          collectionId: collectionFilter,
        });

        if (response.success) {
          setResults(response.data);
          setSelectedIndex(0);
        }
      });
    },
    [mode, languageFilter, collectionFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            router.push(paths.appPaths.snippetView(results[selectedIndex].id));
            handleClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, results, selectedIndex, router, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border bg-popover shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search snippets..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
              <span className="text-xs text-muted-foreground">Mode:</span>
              <button
                onClick={() => setMode("text")}
                className={cn(
                  "cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                  mode === "text"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-3 w-3" />
                Text
              </button>
              <button
                onClick={() => setMode("semantic")}
                className={cn(
                  "cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                  mode === "semantic"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles className="h-3 w-3" />
                Semantic
              </button>

              <div className="h-4 w-px bg-border mx-1" />

              {/* language filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                      languageFilter
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Code2 className="h-3 w-3" />
                    {languageFilter ?? "Language"}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setLanguageFilter(null)}>
                    All Languages
                  </DropdownMenuItem>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguageFilter(lang)}
                    >
                      {lang}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* collection filter */}
              {collections.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                        collectionFilter
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FolderOpen className="h-3 w-3" />
                      {collectionFilter
                        ? collections.find((c) => c.id === collectionFilter)?.name ?? "Collection"
                        : "Collection"}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                    <DropdownMenuItem onClick={() => setCollectionFilter(null)}>
                      All Collections
                    </DropdownMenuItem>
                    {collections.map((col) => (
                      <DropdownMenuItem
                        key={col.id}
                        onClick={() => setCollectionFilter(col.id)}
                      >
                        {col.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && query && !isPending && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No snippets found
                </div>
              )}
              {results.length === 0 && !query && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    router.push(paths.appPaths.snippetView(result.id));
                    handleClose();
                  }}
                  className={cn(
                    "cursor-pointer w-full flex items-start gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {result.title}
                      </span>
                      <LanguageBadge language={result.language} />
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    )}
                    {result.collectionName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        in {result.collectionName}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
                    ↑↓
                  </kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
                    ↵
                  </kbd>{" "}
                  open
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">
                    esc
                  </kbd>{" "}
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
