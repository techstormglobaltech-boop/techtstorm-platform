import SettingsManager from "@/components/admin/SettingsManager";
import { auth } from "@/auth";
import { getUsers } from "@/app/actions/user-management";
import { getGlobalSettings } from "@/app/actions/settings";
import { getMyProfile } from "@/app/actions/profile";
import { UserRole } from "@/types/user";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Settings',
};


export default async function SettingsPage() {
  const [admins, session, globalSettings, userProfile] = await Promise.all([
    getUsers(UserRole.ADMIN),
    auth(),
    getGlobalSettings(),
    getMyProfile()
  ]);

  return (
    <SettingsManager 
        initialAdmins={admins} 
        currentUser={userProfile || session?.user} 
        initialGlobalSettings={globalSettings}
    />
  );
}
