import { Suspense } from "react";
import Link from "next/link";
import { Plus, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnippetGrid } from "@/components/snippets";
import { EmptyState } from "@/components/shared";
import { getUserSnippets } from "@/actions/snippets";
import { paths } from "@/lib/paths";

async function SnippetsList() {
  const snippets = await getUserSnippets();

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={Code}
        title="No snippets yet"
        description="Create your first snippet to start building your library"
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

export default function DashboardSnippetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Snippets</h1>
          <p className="text-muted-foreground">
            Manage and organize your code snippets
          </p>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-40 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <SnippetsList />
      </Suspense>
    </div>
  );
}
