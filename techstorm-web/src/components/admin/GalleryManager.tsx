"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { addGalleryImage, deleteGalleryImage } from "@/app/actions/gallery";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface GalleryManagerProps {
  initialImages: any[];
}

export default function GalleryManager({ initialImages }: GalleryManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "events",
    url: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
            setForm(prev => ({ ...prev, url: data.url }));
            toast.success("Image uploaded");
        } else {
            toast.error("Upload failed");
        }
    } catch (err) {
        toast.error("Error uploading");
    } finally {
        setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) {
        toast.error("Please upload an image");
        return;
    }

    setIsSubmitting(true);
    const result = await addGalleryImage(form);
    setIsSubmitting(false);

    if (result.success) {
        toast.success("Added to gallery!");
        setIsModalOpen(false);
        setForm({ title: "", description: "", category: "events", url: "" });
        startTransition(async () => {
            // Optimistic update or refresh could go here
            // For now, simpler to just refresh page via router or rely on server action revalidation if passing new props
            // But since we are client side state, we should probably just refresh
            window.location.reload(); 
        });
    } else {
        toast.error("Failed to add");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteGalleryImage(deleteId);
    if (result.success) {
        toast.success("Deleted");
        setImages(images.filter(img => img.id !== deleteId));
        setDeleteId(null);
    } else {
        toast.error("Failed to delete");
    }
  };

  return (
    <div>
        <div className="flex justify-end mb-6">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#006066] transition-colors flex items-center gap-2"
            >
                <i className="fas fa-plus"></i> Add Photo
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
                <div key={img.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 group">
                    <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-slate-100">
                        <Image src={img.url} alt={img.title || "Gallery Image"} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <button 
                            onClick={() => handleDeleteClick(img.id)}
                            className="absolute top-2 right-2 bg-white/90 text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                    <h4 className="font-bold text-brand-dark truncate">{img.title}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mt-1">{img.category}</p>
                </div>
            ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add to Gallery">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-teal transition-colors relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {form.url ? (
                        <div className="relative h-32 w-full">
                            <Image src={form.url} alt="Preview" fill className="object-contain" />
                        </div>
                    ) : (
                        <div className="text-slate-400">
                            {isUploading ? <i className="fas fa-spinner fa-spin text-2xl"></i> : <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>}
                            <p className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload image"}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-teal"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-teal"
                        value={form.category}
                        onChange={(e) => setForm({...form, category: e.target.value})}
                    >
                        <option value="events">Events</option>
                        <option value="mentorship">Mentorship</option>
                        <option value="showcase">Showcase</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                        rows={2}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-brand-teal resize-none"
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                    />
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isUploading}
                        className="w-full bg-brand-teal text-white py-2.5 rounded-lg font-bold hover:bg-[#006066] disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "Add to Gallery"}
                    </button>
                </div>
            </form>
        </Modal>

        <ConfirmModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Delete Image?"
            message="Are you sure you want to delete this image from the gallery? This cannot be undone."
        />
    </div>
  );
}
