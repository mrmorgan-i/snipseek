import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "./user-button";
import { Logo } from "@/components/shared";
import { paths } from "@/lib/paths";
import type { SessionUser } from "@/lib/auth/session";

type HeaderProps = {
  user: SessionUser;
  onSearchClick?: () => void;
};

export function Header({ user, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href={paths.appPaths.dashboard}>
            <Logo size={32} showText className="hidden sm:flex" />
            <Logo size={32} className="sm:hidden" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-muted-foreground"
            onClick={onSearchClick}
          >
            <Search className="h-4 w-4" />
            <span>Search snippets...</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={onSearchClick}
          >
            <Search className="h-5 w-5" />
          </Button>

          <UserButton user={user} />
        </div>
      </div>
    </header>
  );
}
