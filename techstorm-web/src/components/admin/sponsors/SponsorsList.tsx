"use client";

import { useState } from "react";
import Image from "next/image";
import { createSponsor, deleteSponsor } from "@/app/actions/admin/sponsors";
import toast from "react-hot-toast";

export default function SponsorsList({ sponsors }: { sponsors: any[] }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    const res = await deleteSponsor(id);
    if (res.success) toast.success("Sponsor deleted");
    else toast.error("Failed to delete");
  };

  const handleCreate = async (formData: FormData) => {
    const res = await createSponsor(null, formData);
    if (res.success) {
      toast.success("Sponsor added");
      setIsAdding(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-brand-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-[#006066] transition-colors"
        >
            {isAdding ? "Cancel" : "Add Sponsor"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 max-w-lg">
            <h3 className="font-bold text-lg mb-4">Add New Sponsor</h3>
            <form action={handleCreate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Logo URL</label>
                    <input name="logoUrl" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Website URL (Optional)</label>
                    <input name="websiteUrl" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Display Order</label>
                    <input name="order" type="number" defaultValue={0} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <button type="submit" className="w-full bg-brand-dark text-white py-2 rounded-lg hover:bg-black transition-colors">
                    Save Sponsor
                </button>
            </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(sponsor.id)} className="text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
                <div className="relative w-full h-20 mb-3 grayscale group-hover:grayscale-0 transition-all">
                    <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain" />
                </div>
                <p className="font-bold text-sm text-center">{sponsor.name}</p>
                {sponsor.websiteUrl && (
                    <a href={sponsor.websiteUrl} target="_blank" className="text-xs text-brand-teal hover:underline mt-1 truncate max-w-full">
                        View Website
                    </a>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}
