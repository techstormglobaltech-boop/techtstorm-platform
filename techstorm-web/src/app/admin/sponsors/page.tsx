import { getSponsors } from "@/app/actions/admin/sponsors";
import SponsorsList from "@/components/admin/sponsors/SponsorsList";

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-brand-dark">Sponsors</h1>
            <p className="text-slate-500">Manage partner and sponsor logos displayed on the homepage.</p>
        </div>
      </div>
      <SponsorsList sponsors={sponsors} />
    </div>
  );
}
