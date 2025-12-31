import { cn } from "@/lib/utils";

type CodePreviewProps = {
  code: string;
  language?: string;
  maxLines?: number;
  className?: string;
};

export function CodePreview({
  code,
  maxLines = 5,
  className,
}: CodePreviewProps) {
  const lines = code.split("\n");
  const displayLines = lines.slice(0, maxLines);
  const hasMore = lines.length > maxLines;

  return (
    <div
      className={cn(
        "relative rounded-md bg-muted/50 border border-border overflow-hidden w-full min-w-0",
        className
      )}
    >
      <pre className="p-3 text-xs font-mono w-full min-w-0 max-w-full">
        <code className="text-foreground/90 whitespace-pre-wrap wrap-break-word">
          {displayLines.map((line, i) => (
            <span key={i} className="block whitespace-pre-wrap wrap-break-word">
              {line || " "}
            </span>
          ))}
        </code>
      </pre>
      {hasMore && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-muted/80 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
