import { getMyProfile } from "@/app/actions/profile";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

export default async function SettingsPage() {
  const profile = await getMyProfile();

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your professional profile and social links.</p>
      </div>

      <ProfileSettingsForm initialData={profile} />
    </div>
  );
}