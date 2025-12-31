import { PublicHeader } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children}</main>
    </div>
  );
}
