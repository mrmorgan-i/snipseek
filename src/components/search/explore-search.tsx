"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Sparkles, FileText, Loader2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LanguageBadge, TagList, CodePreview } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchPublicSnippets } from "@/actions/snippets";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  isPublic: boolean;
  createdAt: Date;
  authorName?: string | null;
  authorImage?: string | null;
};

type ExploreSearchProps = {
  initialSnippets: SearchResult[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function ExploreSearch({
  initialSnippets,
  currentPage,
  totalPages,
  totalCount,
}: ExploreSearchProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"text" | "semantic">("text");
  const [results, setResults] = useState<SearchResult[]>(initialSnippets);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) {
      setResults(initialSnippets);
      setHasSearched(false);
      return;
    }

    startTransition(async () => {
      const response = await searchPublicSnippets({
        query,
        mode,
      });

      if (response.success) {
        setResults(response.data);
        setHasSearched(true);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search public snippets..."
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setMode("text")}
              className={cn(
                "cursor-pointer flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
                mode === "text"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              Text
            </button>
            <button
              onClick={() => setMode("semantic")}
              className={cn(
                "cursor-pointer flex items-center gap-1.5 px-3 py-2 text-sm transition-colors",
                mode === "semantic"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </button>
          </div>

          <Button onClick={handleSearch} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>

      {hasSearched && (
        <p className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? "s" : ""}
          {query && ` for "${query}"`}
        </p>
      )}

      {results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No snippets found
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full overflow-x-hidden">
            {results.map((snippet) => {
              const formattedDate = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
              }).format(new Date(snippet.createdAt));

              return (
                <Link
                  key={snippet.id}
                  href={paths.publicPaths.exploreSnippet(snippet.id)}
                >
                  <Card className="group hover:border-primary/50 transition-colors cursor-pointer h-full w-full min-w-0 overflow-hidden">
                    <CardContent className="p-4 flex flex-col h-full w-full min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors mb-2">
                        {snippet.title}
                      </h3>

                      {snippet.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {snippet.description}
                        </p>
                      )}

                      <CodePreview
                        code={snippet.code}
                        language={snippet.language}
                        maxLines={4}
                        className="mb-3 flex-1"
                      />

                      <div className="flex items-center gap-2 mb-3">
                        <LanguageBadge language={snippet.language} />
                        <TagList tags={snippet.tags} max={2} />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={snippet.authorImage ?? undefined} />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {snippet.authorName
                                ? snippet.authorName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {snippet.authorName ?? "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* pagination */}
          {!hasSearched && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} ({totalCount} total snippets)
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
                      aria-disabled={currentPage <= 1}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink href="?page=1">1</PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink href={`?page=${currentPage - 1}`}>
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink href={`?page=${currentPage}`} isActive>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink href={`?page=${currentPage + 1}`}>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink href={`?page=${totalPages}`}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"}
                      aria-disabled={currentPage >= totalPages}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
