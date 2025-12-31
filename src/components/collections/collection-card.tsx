"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, MoreVertical, Edit, Trash2, Code } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteCollection, updateCollection } from "@/actions/collections";
import { paths } from "@/lib/paths";

type CollectionCardProps = {
  id: string;
  name: string;
  isDefault: boolean;
  snippetCount: number;
};

export function CollectionCard({
  id,
  name,
  isDefault,
  snippetCount,
}: CollectionCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRename = () => {
    if (editName.trim() === name) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      const result = await updateCollection({ id, name: editName.trim() });

      if (result.success) {
        toast.success("Collection renamed");
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setIsEditing(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCollection({ id });

      if (result.success) {
        toast.success("Collection deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (showDeleteConfirm) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm mb-3">
            Delete &quot;{name}&quot;? Snippets will move to Uncategorized.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={paths.appPaths.collectionView(id)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") {
                      setEditName(name);
                      setIsEditing(false);
                    }
                  }}
                  onClick={(e) => e.preventDefault()}
                  className="font-medium text-sm bg-transparent border-b border-primary outline-none w-full"
                  autoFocus
                />
              ) : (
                <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {name}
                </h3>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Code className="h-3 w-3" />
                {snippetCount} snippet{snippetCount !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>

          {!isDefault && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 z-50 rounded-lg border bg-popover p-1 shadow-lg">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
