import LegalManager from "@/components/admin/LegalManager";
import { auth } from "@/auth";

export const metadata = {
  title: "Legal Documents | Admin | TechStorm Global",
};

export default async function AdminLegalPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark">Legal Documents</h2>
          <p className="text-slate-500 mt-1">
            Manage the Privacy Policy and Terms of Service content.
          </p>
        </div>
      </div>

      <LegalManager token={token} />
    </div>
  );
}
