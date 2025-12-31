import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SnippetForm } from "@/components/snippets";
import { getUserCollections, getDefaultCollection } from "@/actions/collections";
import { paths } from "@/lib/paths";

export default async function DashboardSnippetNewPage() {
  const [collections, defaultCollection] = await Promise.all([
    getUserCollections(),
    getDefaultCollection(),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={paths.appPaths.snippets}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Snippet</h1>
          <p className="text-muted-foreground">
            Create a new code snippet
          </p>
        </div>
      </div>

      <SnippetForm
        mode="create"
        collections={collections}
        defaultCollectionId={defaultCollection?.id ?? collections[0]?.id ?? ""}
      />
    </div>
  );
}
