import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Globe, Lock, Clock, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageBadge, TagList } from "@/components/shared";
import { SnippetActions } from "@/components/snippets/snippet-actions";
import { SnippetCodeView } from "@/components/snippets/snippet-code-view";
import { getSnippetById } from "@/actions/snippets";
import { getUserCollections } from "@/actions/collections";
import { paths } from "@/lib/paths";

export default async function DashboardSnippetViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [snippet, collections] = await Promise.all([
    getSnippetById(id),
    getUserCollections(),
  ]);

  if (!snippet) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(snippet.createdAt));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={paths.appPaths.snippets}
            className="p-2 rounded-lg hover:bg-accent transition-colors mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-muted-foreground mt-1">{snippet.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={paths.appPaths.snippetEdit(id)}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <SnippetActions
            snippetId={id}
            isPublic={snippet.isPublic}
            currentCollectionId={snippet.collectionId}
            collections={collections}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {snippet.isPublic ? (
            <>
              <Globe className="h-4 w-4 text-emerald" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Private</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>
        {snippet.collectionName && (
          <div className="flex items-center gap-1.5">
            <FolderOpen className="h-4 w-4" />
            <span>{snippet.collectionName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LanguageBadge language={snippet.language} />
        <TagList tags={snippet.tags} />
      </div>

      <SnippetCodeView code={snippet.code} language={snippet.language} />
    </div>
  );
}
