import SettingsManager from "@/components/admin/SettingsManager";
import { getUsers } from "@/app/actions/user-management";
import { auth } from "@/auth";
import { getGlobalSettings } from "@/app/actions/settings";

export const metadata = {
  title: "TechStorm Admin | Settings",
  description: "Configure platform settings and account preferences.",
};

export default async function SettingsPage() {
  const [admins, session, globalSettings] = await Promise.all([
    getUsers("ADMIN"),
    auth(),
    getGlobalSettings()
  ]);

  return (
    <SettingsManager 
        initialAdmins={admins} 
        currentUser={session?.user} 
        initialGlobalSettings={globalSettings}
    />
  );
}
