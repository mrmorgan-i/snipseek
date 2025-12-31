import Link from "next/link";
import { Globe, Lock, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageBadge } from "@/components/shared/language-badge";
import { TagList } from "@/components/shared/tag-list";
import { CodePreview } from "@/components/shared/code-preview";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

type SnippetCardProps = {
  id: string;
  title: string;
  description?: string | null;
  code: string;
  language: string;
  tags?: string[] | null;
  isPublic: boolean;
  collectionName?: string | null;
  createdAt: Date;
  className?: string;
};

export function SnippetCard({
  id,
  title,
  description,
  code,
  language,
  tags,
  isPublic,
  collectionName,
  createdAt,
  className,
}: SnippetCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));

  return (
    <Link href={paths.appPaths.snippetView(id)}>
      <Card
        className={cn(
          "group hover:border-primary/50 transition-colors cursor-pointer w-full min-w-0 overflow-hidden",
          className
        )}
      >
        <CardContent className="p-4 w-full min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {isPublic ? (
                <Globe className="h-3.5 w-3.5 text-emerald" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          </div>

          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          <CodePreview code={code} language={language} maxLines={4} className="mb-3" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LanguageBadge language={language} />
              <TagList tags={tags} max={2} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </div>
            {collectionName && (
              <span className="truncate">in {collectionName}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
