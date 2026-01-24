import SettingsManager from "@/components/admin/SettingsManager";
import { auth } from "@/auth";
import { getUsers } from "@/app/actions/user-management";
import { getGlobalSettings } from "@/app/actions/settings";
import { UserRole } from "@/types/user";

export default async function SettingsPage() {
  const [admins, session, globalSettings] = await Promise.all([
    getUsers(UserRole.ADMIN),
    auth(),
    getGlobalSettings()
  ]);

  return (
    <SettingsManager 
        initialAdmins={admins} 
        currentUser={session?.user as any} 
        initialGlobalSettings={globalSettings}
    />
  );
}
