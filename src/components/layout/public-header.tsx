import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared";
import { paths } from "@/lib/paths";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        <Link href={paths.publicPaths.home}>
          <Logo size={32} showText />
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href={paths.publicPaths.explore}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href={paths.publicPaths.signIn}>
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href={paths.publicPaths.signUp}>
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
