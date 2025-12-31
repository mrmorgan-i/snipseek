import type { Metadata } from "next";
import { Suspense } from "react";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ExploreSearch } from "@/components/search";
import { EmptyState } from "@/components/shared";
import { getPublicSnippets, getPublicSnippetsCount } from "@/actions/snippets";

export const metadata: Metadata = {
  title: "Explore Public Snippets - SnipSeek",
  description: "Discover and explore code snippets shared by the community. Browse public code snippets with AI-powered search.",
  openGraph: {
    title: "Explore Public Snippets - SnipSeek",
    description: "Discover and explore code snippets shared by the community.",
    type: "website",
  },
};

const ITEMS_PER_PAGE = 15;

type ExplorePageProps = {
  searchParams: Promise<{ page?: string }>;
};

async function ExploreContent({ page }: { page: number }) {
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const [snippets, totalCount] = await Promise.all([
    getPublicSnippets({ limit: ITEMS_PER_PAGE, offset }),
    getPublicSnippetsCount(),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (snippets.length === 0 && page === 1) {
    return (
      <EmptyState
        icon={Globe}
        title="No public snippets yet"
        description="Be the first to share a snippet with the community!"
      />
    );
  }

  return (
    <ExploreSearch
      initialSnippets={snippets}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
    />
  );
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Public Snippets</h1>
        <p className="text-muted-foreground">
          Discover code snippets shared by the community
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-40 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <ExploreContent page={page} />
      </Suspense>
    </div>
  );
}
