import { auth } from "@/auth";
import SettingsView from "@/components/mentee/SettingsView";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account Settings | TechStorm Global",
  description: "Manage your profile and security preferences."
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account profile and security.</p>
      </div>

      <SettingsView user={{
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      }} />
    </div>
  );
}
