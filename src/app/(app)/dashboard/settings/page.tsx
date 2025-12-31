import { requireAuth } from "@/lib/auth/session";
import { SettingsForm } from "@/components/settings/settings-form";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function DashboardSettingsPage() {
  const session = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsForm user={session.user} />
      <DangerZone />
    </div>
  );
}
