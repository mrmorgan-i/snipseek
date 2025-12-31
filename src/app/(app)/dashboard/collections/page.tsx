import { Suspense } from "react";
import { FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CollectionCard, CreateCollectionDialog } from "@/components/collections";
import { EmptyState } from "@/components/shared";
import { getUserCollections } from "@/actions/collections";
import { getSnippetCountsByCollection } from "@/actions/snippets";

async function CollectionsList() {
  const [collections, snippetCounts] = await Promise.all([
    getUserCollections(),
    getSnippetCountsByCollection(),
  ]);

  if (collections.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No collections yet"
        description="Create your first collection to organize your snippets"
        action={<CreateCollectionDialog />}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          id={collection.id}
          name={collection.name}
          isDefault={collection.isDefault}
          snippetCount={snippetCounts[collection.id] || 0}
        />
      ))}
    </div>
  );
}

export default function DashboardCollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Organize your snippets into collections
          </p>
        </div>
        <CreateCollectionDialog />
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <CollectionsList />
      </Suspense>
    </div>
  );
}
