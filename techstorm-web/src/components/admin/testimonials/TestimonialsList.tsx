"use client";

import { useState } from "react";
import Image from "next/image";
import { createTestimonial, deleteTestimonial } from "@/app/actions/admin/testimonials";
import toast from "react-hot-toast";

export default function TestimonialsList({ testimonials }: { testimonials: any[] }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const res = await deleteTestimonial(id);
    if (res.success) toast.success("Testimonial deleted");
    else toast.error("Failed to delete");
  };

  const handleCreate = async (formData: FormData) => {
    const res = await createTestimonial(null, formData);
    if (res.success) {
      toast.success("Testimonial added");
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
            {isAdding ? "Cancel" : "Add Testimonial"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Add New Testimonial</h3>
            <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Role</label>
                    <input name="role" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" placeholder="e.g. Data Scientist" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Content</label>
                    <textarea name="content" required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Image URL (Optional)</label>
                    <input name="image" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" placeholder="https://..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Company (Optional)</label>
                    <input name="company" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Rating (1-5)</label>
                    <input name="rating" type="number" min="1" max="5" defaultValue={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal p-2 border" />
                </div>
                <div className="md:col-span-2">
                    <button type="submit" className="w-full bg-brand-dark text-white py-2 rounded-lg hover:bg-black transition-colors">
                        Save Testimonial
                    </button>
                </div>
            </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 bg-slate-50 rounded-full p-2 shadow-sm">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 relative">
                        {t.image ? (
                            <Image src={t.image} alt={t.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{t.name[0]}</div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-brand-dark">{t.name}</h4>
                        <p className="text-xs text-brand-teal uppercase font-bold">{t.role}</p>
                    </div>
                </div>
                <div className="flex text-amber-400 text-xs mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < t.rating ? "" : "text-slate-200"}`}></i>
                    ))}
                </div>
                <p className="text-slate-600 text-sm italic">"{t.content}"</p>
            </div>
        ))}
      </div>
    </div>
  );
}
