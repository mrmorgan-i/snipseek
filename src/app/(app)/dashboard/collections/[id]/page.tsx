import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnippetGrid } from "@/components/snippets";
import { EmptyState } from "@/components/shared";
import { getCollectionById } from "@/actions/collections";
import { getUserSnippets } from "@/actions/snippets";
import { paths } from "@/lib/paths";

async function CollectionSnippets({ collectionId }: { collectionId: string }) {
  const snippets = await getUserSnippets({ collectionId });

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={Code}
        title="No snippets in this collection"
        description="Add snippets to this collection to see them here"
        action={
          <Link href={paths.appPaths.snippetNew}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Snippet
            </Button>
          </Link>
        }
      />
    );
  }

  return <SnippetGrid snippets={snippets} />;
}

export default async function DashboardCollectionViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={paths.appPaths.collections}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground">
              {collection.isDefault
                ? "Default collection for uncategorized snippets"
                : "Collection"}
            </p>
          </div>
        </div>
        <Link href={paths.appPaths.snippetNew}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Snippet
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-40 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <CollectionSnippets collectionId={id} />
      </Suspense>
    </div>
  );
}
