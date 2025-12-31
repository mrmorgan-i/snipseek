"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Trash2,
  Globe,
  Lock,
  FolderOpen,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteSnippet,
  toggleSnippetVisibility,
  moveSnippet,
} from "@/actions/snippets";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

type Collection = {
  id: string;
  name: string;
};

type SnippetActionsProps = {
  snippetId: string;
  isPublic: boolean;
  currentCollectionId: string;
  collections: Collection[];
};

export function SnippetActions({
  snippetId,
  isPublic,
  currentCollectionId,
  collections,
}: SnippetActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const [moveMenuPosition, setMoveMenuPosition] = useState<"right" | "left">("right");

  // check if move menu would go off-screen and position it on the left if needed
  const handleToggleMoveMenu = () => {
    if (!showMoveMenu && moveButtonRef.current) {
      const buttonRect = moveButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const menuWidth = 192;
      const spaceOnRight = viewportWidth - buttonRect.right;
      
      setMoveMenuPosition(spaceOnRight < menuWidth + 16 ? "left" : "right");
    }
    setShowMoveMenu(!showMoveMenu);
  };

  const handleToggleVisibility = () => {
    startTransition(async () => {
      const result = await toggleSnippetVisibility({
        id: snippetId,
        isPublic: !isPublic,
      });

      if (result.success) {
        toast.success(isPublic ? "Snippet is now private" : "Snippet is now public");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
    setIsOpen(false);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSnippet({ id: snippetId });

      if (result.success) {
        toast.success("Snippet deleted");
        router.push(paths.appPaths.snippets);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleMove = (collectionId: string) => {
    if (collectionId === currentCollectionId) {
      setShowMoveMenu(false);
      setIsOpen(false);
      setMoveMenuPosition("right");
      return;
    }

    startTransition(async () => {
      const result = await moveSnippet({
        id: snippetId,
        collectionId,
      });

      if (result.success) {
        const collectionName = collections.find((c) => c.id === collectionId)?.name;
        toast.success(`Moved to ${collectionName}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
    setShowMoveMenu(false);
    setIsOpen(false);
    setMoveMenuPosition("right");
  };


  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Delete?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setShowMoveMenu(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 w-48 z-50 rounded-lg border bg-popover p-1 shadow-lg">
            <button
              onClick={handleToggleVisibility}
              className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
            >
              {isPublic ? (
                <>
                  <Lock className="h-4 w-4" />
                  Make Private
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Make Public
                </>
              )}
            </button>

            <div className="relative">
              <button
                ref={moveButtonRef}
                onClick={handleToggleMoveMenu}
                className="cursor-pointer flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Move to...
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>

              {showMoveMenu && (
                <div
                  ref={moveMenuRef}
                  className={cn(
                    "absolute top-0 w-48 rounded-lg border bg-popover p-1 shadow-lg max-h-60 overflow-y-auto z-50",
                    moveMenuPosition === "right"
                      ? "left-full ml-1"
                      : "right-full mr-1"
                  )}
                >
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleMove(collection.id)}
                      className="cursor-pointer flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <span className="truncate">{collection.name}</span>
                      {collection.id === currentCollectionId && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowDeleteConfirm(true);
                setIsOpen(false);
              }}
              className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
