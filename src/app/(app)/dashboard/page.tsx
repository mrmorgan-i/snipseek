import { Suspense } from "react";
import Link from "next/link";
import { Code, FolderOpen, Globe, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnippetGrid } from "@/components/snippets";
import { EmptyState } from "@/components/shared";
import { getUserSnippets, getUserSnippetStats } from "@/actions/snippets";
import { getUserCollectionsCount } from "@/actions/collections";
import { requireAuth } from "@/lib/auth/session";
import { paths } from "@/lib/paths";

async function DashboardStats() {
  const [snippetStats, collectionsCount] = await Promise.all([
    getUserSnippetStats(),
    getUserCollectionsCount(),
  ]);

  const stats = [
    {
      label: "Total Snippets",
      value: snippetStats.total,
      icon: Code,
      color: "text-cyan",
    },
    {
      label: "Public",
      value: snippetStats.public,
      icon: Globe,
      color: "text-emerald",
    },
    {
      label: "Collections",
      value: collectionsCount,
      icon: FolderOpen,
      color: "text-violet",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentSnippets() {
  const snippets = await getUserSnippets({ limit: 6 });

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={Code}
        title="No snippets yet"
        description="Create your first snippet to get started"
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

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your snippet library
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
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Snippets</h2>
          <Link
            href={paths.appPaths.snippets}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
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
          <RecentSnippets />
        </Suspense>
      </div>
    </div>
  );
}
