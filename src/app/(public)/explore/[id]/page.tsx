import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageBadge, TagList } from "@/components/shared";
import { SnippetCodeView } from "@/components/snippets/snippet-code-view";
import { getPublicSnippetById } from "@/actions/snippets";
import { paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const snippet = await getPublicSnippetById(id);

  if (!snippet) {
    return {
      title: "Snippet Not Found - SnipSeek",
    };
  }

  const description = snippet.description
    ? `${snippet.description.substring(0, 150)}...`
    : `Code snippet in ${snippet.language} by ${snippet.authorName ?? "Anonymous"}`;

  return {
    title: `${snippet.title} - SnipSeek`,
    description,
    openGraph: {
      title: snippet.title,
      description,
      type: "article",
      authors: snippet.authorName ? [snippet.authorName] : undefined,
    },
  };
}

export default async function ExploreSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snippet = await getPublicSnippetById(id);

  if (!snippet) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(snippet.createdAt));

  const authorInitials = snippet.authorName
    ? snippet.authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href={paths.publicPaths.explore}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>

        <h1 className="text-2xl font-bold mb-2">{snippet.title}</h1>
        {snippet.description && (
          <p className="text-muted-foreground">{snippet.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={snippet.authorImage ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <span>{snippet.authorName ?? "Anonymous"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-emerald" />
          <span>Public</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <LanguageBadge language={snippet.language} />
        <TagList tags={snippet.tags} />
      </div>

      <SnippetCodeView code={snippet.code} language={snippet.language} />
    </div>
  );
}
