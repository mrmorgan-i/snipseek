"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteAccount } from "@/actions/user";
import { signOut } from "@/lib/auth/client";
import { paths } from "@/lib/paths";

export function DangerZone() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirmText !== "DELETE") return;

    startTransition(async () => {
      const result = await deleteAccount();

      if (result.success) {
        await signOut();
        toast.success("Account deleted");
        router.push(paths.publicPaths.home);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <>
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your
            snippets and collections will be permanently deleted.
          </p>

          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-destructive/50 bg-popover p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Account
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowConfirm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. This will permanently delete your
                account and remove all your snippets and collections.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Type <span className="font-mono text-destructive">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-md border border-destructive/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE" || isPending}
                >
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
