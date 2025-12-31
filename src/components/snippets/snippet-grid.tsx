import { SnippetCard } from "./snippet-card";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  isPublic: boolean;
  collectionName?: string | null;
  createdAt: Date;
};

type SnippetGridProps = {
  snippets: Snippet[];
};

export function SnippetGrid({ snippets }: SnippetGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full overflow-x-hidden">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          id={snippet.id}
          title={snippet.title}
          description={snippet.description}
          code={snippet.code}
          language={snippet.language}
          tags={snippet.tags}
          isPublic={snippet.isPublic}
          collectionName={snippet.collectionName}
          createdAt={snippet.createdAt}
        />
      ))}
    </div>
  );
}
