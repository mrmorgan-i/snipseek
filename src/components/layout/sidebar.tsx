"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Code,
  FolderOpen,
  Globe,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: paths.appPaths.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "My Snippets",
    href: paths.appPaths.snippets,
    icon: Code,
  },
  {
    label: "Collections",
    href: paths.appPaths.collections,
    icon: FolderOpen,
  },
  {
    label: "Explore",
    href: paths.publicPaths.explore,
    icon: Globe,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border bg-sidebar">
      <div className="flex flex-col flex-1 p-4">
        <Link href={paths.appPaths.snippetNew}>
          <Button className="w-full justify-start gap-2 mb-6">
            <Plus className="h-4 w-4" />
            New Snippet
          </Button>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== paths.appPaths.dashboard &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
