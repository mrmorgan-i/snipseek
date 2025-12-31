import { requireAuth } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout";
import { getUserCollections } from "@/actions/collections";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const collections = await getUserCollections();

  return (
    <DashboardShell user={session.user} collections={collections}>
      {children}
    </DashboardShell>
  );
}
