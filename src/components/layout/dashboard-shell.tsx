"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "@/components/search/command-palette";
import type { SessionUser } from "@/lib/auth/session";

type Collection = {
  id: string;
  name: string;
};

type DashboardShellProps = {
  user: SessionUser;
  collections: Collection[];
  children: React.ReactNode;
};

export function DashboardShell({
  user,
  collections,
  children,
}: DashboardShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSearchClick={() => setIsSearchOpen(true)} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        collections={collections}
      />
    </div>
  );
}
