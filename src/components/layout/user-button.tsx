"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  Code,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";
import { paths } from "@/lib/paths";
import type { SessionUser } from "@/lib/auth/session";

type UserButtonProps = {
  user: SessionUser;
};

export function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push(paths.publicPaths.home);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2 py-1.5 h-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
          {user.name || user.email}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 z-50 rounded-lg border bg-popover p-1 shadow-lg"
            >
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              <Link
                href={paths.appPaths.dashboard}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href={paths.appPaths.snippets}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <Code className="h-4 w-4" />
                Snippets
              </Link>

              <Link
                href={paths.appPaths.collections}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Collections
              </Link>

              <Link
                href={paths.appPaths.settings}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors w-full text-left text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
