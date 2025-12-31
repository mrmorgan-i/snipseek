"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Loader2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodeEditor } from "@/components/shared";
import { createSnippet, updateSnippet } from "@/actions/snippets";
import { paths } from "@/lib/paths";
import { SUPPORTED_LANGUAGES } from "@/lib/validation";
import { cn } from "@/lib/utils";

type Collection = {
  id: string;
  name: string;
};

type SnippetFormProps = {
  mode: "create" | "edit";
  collections: Collection[];
  defaultCollectionId: string;
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    tags: string[] | null;
    collectionId: string;
    isPublic: boolean;
  };
};

export function SnippetForm({
  mode,
  collections,
  defaultCollectionId,
  initialData,
}: SnippetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [code, setCode] = useState(initialData?.code ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "javascript");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") ?? "");
  const [collectionId, setCollectionId] = useState(
    initialData?.collectionId ?? defaultCollectionId
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    startTransition(async () => {
      if (mode === "create") {
        const result = await createSnippet({
          title,
          description: description || null,
          code,
          language: language as typeof SUPPORTED_LANGUAGES[number],
          tags: tags.length > 0 ? tags : null,
          collectionId,
          isPublic,
        });

        if (result.success) {
          toast.success("Snippet created!");
          if (result.data.embeddingFailed) {
            toast.warning("AI search unavailable for this snippet, using text search");
          }
          router.push(paths.appPaths.snippetView(result.data.id));
        } else {
          toast.error(result.error);
        }
      } else if (initialData) {
        const result = await updateSnippet({
          id: initialData.id,
          title,
          description: description || null,
          code,
          language: language as typeof SUPPORTED_LANGUAGES[number],
          tags: tags.length > 0 ? tags : null,
          collectionId,
          isPublic,
        });

        if (result.success) {
          toast.success("Snippet updated!");
          if (result.embeddingFailed) {
            toast.warning("AI search unavailable for this snippet, using text search");
          }
          router.push(paths.appPaths.snippetView(initialData.id));
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React useDebounce hook"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of what this snippet does. Use this to improve semantic search..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Language <span className="text-destructive">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Collection</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tags <span className="text-muted-foreground text-xs">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., react, hooks, typescript"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <label className="block text-sm font-medium mb-2">
            Code <span className="text-destructive">*</span>
          </label>
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            height="400px"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {code.length.toLocaleString()} / 10,000 characters
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <motion.button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={cn(
            "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
            isPublic
              ? "border-emerald bg-emerald/10 text-emerald"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
          whileTap={{ scale: 0.98 }}
        >
          {isPublic ? (
            <>
              <Globe className="h-4 w-4" />
              Public
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Private
            </>
          )}
        </motion.button>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {mode === "create" ? "Create Snippet" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
