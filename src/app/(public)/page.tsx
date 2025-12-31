import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Sparkles, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared";
import { paths } from "@/lib/paths";

export const metadata: Metadata = {
  title: "SnipSeek - AI-Powered Code Snippet Manager",
  description: "Save, organize, and discover code snippets with AI-powered semantic search. Free code snippet manager for developers.",
  openGraph: {
    title: "SnipSeek - AI-Powered Code Snippet Manager",
    description: "Save, organize, and discover code snippets with AI-powered semantic search.",
    type: "website",
  },
};

const features = [
  {
    icon: FolderOpen,
    title: "Save & Organize",
    description:
      "Store your code snippets with syntax highlighting and organize them into collections.",
    color: "text-cyan",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Search",
    description:
      "Find snippets by meaning, not just keywords. Our semantic search understands what you're looking for.",
    color: "text-violet",
  },
  {
    icon: Globe,
    title: "Share Publicly",
    description:
      "Make snippets public to share with the community, or keep them private for yourself.",
    color: "text-emerald",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet/20 rounded-full blur-3xl" />
      </div>

      {/* hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your code snippets,{" "}
            <span className="text-primary">organized</span> and{" "}
            <span className="text-primary">searchable</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern code snippet manager with AI-powered semantic search.
            Save, organize, and discover code snippets efficiently.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={paths.publicPaths.signUp}>
              <Button size="lg" className="text-base px-8">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href={paths.publicPaths.explore}>
              <Button variant="outline" size="lg" className="text-base px-8">
                Explore Snippets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Everything you need to manage code snippets
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for developers who want a fast, intelligent way to store and
            find their code.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative p-6 rounded-2xl border bg-card/50 backdrop-blur-sm"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-muted mb-4 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative rounded-3xl border bg-card/50 backdrop-blur-sm p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to organize your code?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join developers who use SnipSeek to manage their code snippets.
            Free to get started.
          </p>
          <Link href={paths.publicPaths.signUp}>
            <Button size="lg" className="text-base px-8">
              Create your account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={32} showText />
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/mrmorgan-i/snipseek"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <p className="text-sm text-muted-foreground">
                Built for the CS50 Final Project
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
