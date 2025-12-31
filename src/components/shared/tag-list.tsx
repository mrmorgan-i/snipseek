import { cn } from "@/lib/utils";

type TagListProps = {
  tags: string[] | null | undefined;
  max?: number;
  className?: string;
};

export function TagList({ tags, max = 5, className }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, max);
  const remaining = tags.length - max;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground"
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}
