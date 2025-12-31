import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SnippetForm } from "@/components/snippets";
import { getSnippetById } from "@/actions/snippets";
import { getUserCollections } from "@/actions/collections";
import { paths } from "@/lib/paths";

export default async function DashboardSnippetEditPage({
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={paths.appPaths.snippetView(id)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Snippet</h1>
          <p className="text-muted-foreground">
            Update your code snippet
          </p>
        </div>
      </div>

      <SnippetForm
        mode="edit"
        collections={collections}
        defaultCollectionId={snippet.collectionId}
        initialData={{
          id: snippet.id,
          title: snippet.title,
          description: snippet.description,
          code: snippet.code,
          language: snippet.language,
          tags: snippet.tags,
          collectionId: snippet.collectionId,
          isPublic: snippet.isPublic,
        }}
      />
    </div>
  );
}
