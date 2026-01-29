"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createTeamMember, deleteTeamMember, updateTeamMember } from "@/app/actions/team";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

interface TeamManagerProps {
  initialMembers: any[];
}

export default function TeamManager({ initialMembers }: TeamManagerProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    order: 0,
  });

  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      bio: "",
      image: "",
      linkedinUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      order: members.length + 1,
    });
    setEditingId(null);
  };

  const handleEditClick = (member: any) => {
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image,
      linkedinUrl: member.linkedinUrl || "",
      twitterUrl: member.twitterUrl || "",
      youtubeUrl: member.youtubeUrl || "",
      order: member.order || 0,
    });
    setEditingId(member.id);
    setIsModalOpen(true);
  };

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
            setForm(prev => ({ ...prev, image: data.url }));
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
    if (!form.image) {
        toast.error("Please upload an image");
        return;
    }

    setIsSubmitting(true);
    
    let result;
    if (editingId) {
        result = await updateTeamMember(editingId, form);
    } else {
        result = await createTeamMember(form);
    }

    setIsSubmitting(false);

    if (result.success) {
        toast.success(editingId ? "Member updated" : "Member added");
        setIsModalOpen(false);
        resetForm();
        startTransition(() => {
             window.location.reload();
        });
    } else {
        toast.error("Operation failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteTeamMember(deleteId);
    if (result.success) {
        toast.success("Member removed");
        setMembers(members.filter(m => m.id !== deleteId));
        setDeleteId(null);
    } else {
        toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-bold text-brand-dark">Leadership Team</h1>
                <p className="text-slate-500 mt-1">Manage the profiles shown on the "Our Team" page.</p>
            </div>
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-brand-teal text-white px-6 py-3 rounded-xl font-bold hover:bg-[#006066] transition-all shadow-lg shadow-brand-teal/20 flex items-center gap-2"
            >
                <i className="fas fa-plus"></i> Add Member
            </button>
        </div>

        {members.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-300 text-5xl">
                    <i className="fas fa-users"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Team Members Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Start building your leadership page by adding your first team member.</p>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="text-brand-teal font-bold hover:underline"
                >
                    Add First Member
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence>
                    {members.map((member, index) => (
                        <motion.div 
                            layout
                            key={member.id} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex items-start justify-between mb-6">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner group-hover:border-brand-teal transition-colors">
                                    <Image src={member.image} alt={member.name} fill className="object-cover" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button 
                                        onClick={() => handleEditClick(member)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-brand-teal hover:text-white transition-colors flex items-center justify-center"
                                        title="Edit"
                                    >
                                        <i className="fas fa-pencil-alt text-xs"></i>
                                    </button>
                                    <button 
                                        onClick={() => setDeleteId(member.id)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash-alt text-xs"></i>
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-brand-dark mb-1 truncate">{member.name}</h3>
                            <p className="text-brand-teal text-xs font-bold uppercase tracking-wider mb-4 truncate">{member.role}</p>
                            
                            <p className="text-slate-500 text-sm line-clamp-3 mb-6 h-[4.5em] leading-relaxed">
                                {member.bio || "No biography provided."}
                            </p>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                {member.linkedinUrl ? (
                                    <a href={member.linkedinUrl} target="_blank" className="text-slate-400 hover:text-[#0077b5] transition-colors"><i className="fab fa-linkedin text-lg"></i></a>
                                ) : <i className="fab fa-linkedin text-lg text-slate-200"></i>}
                                
                                {member.twitterUrl ? (
                                    <a href={member.twitterUrl} target="_blank" className="text-slate-400 hover:text-[#1da1f2] transition-colors"><i className="fab fa-twitter text-lg"></i></a>
                                ) : <i className="fab fa-twitter text-lg text-slate-200"></i>}
                                
                                {member.youtubeUrl ? (
                                    <a href={member.youtubeUrl} target="_blank" className="text-slate-400 hover:text-[#ff0000] transition-colors"><i className="fab fa-youtube text-lg"></i></a>
                                ) : <i className="fab fa-youtube text-lg text-slate-200"></i>}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Profile" : "New Team Member"}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image Upload */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 group cursor-pointer hover:border-brand-teal transition-colors bg-slate-50">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                        {form.image ? (
                            <Image src={form.image} alt="Preview" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                {isUploading ? <i className="fas fa-spinner fa-spin text-2xl"></i> : <i className="fas fa-camera text-2xl mb-1"></i>}
                                <span className="text-[10px] font-bold uppercase">Upload</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <i className="fas fa-pencil-alt text-white"></i>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            placeholder="e.g. Jane Doe"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Role / Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
                            value={form.role}
                            onChange={(e) => setForm({...form, role: e.target.value})}
                            placeholder="e.g. CEO"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bio</label>
                    <textarea 
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all resize-none"
                        value={form.bio}
                        onChange={(e) => setForm({...form, bio: e.target.value})}
                        placeholder="Brief description..."
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Social Links</label>
                    
                    <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400 w-6 text-center"><i className="fab fa-linkedin text-lg"></i></div>
                        <input 
                            type="url" 
                            className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-all"
                            value={form.linkedinUrl}
                            onChange={(e) => setForm({...form, linkedinUrl: e.target.value})}
                            placeholder="LinkedIn URL"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400 w-6 text-center"><i className="fab fa-twitter text-lg"></i></div>
                        <input 
                            type="url" 
                            className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-all"
                            value={form.twitterUrl}
                            onChange={(e) => setForm({...form, twitterUrl: e.target.value})}
                            placeholder="Twitter/X URL"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-3 top-3 text-slate-400 w-6 text-center"><i className="fab fa-youtube text-lg"></i></div>
                        <input 
                            type="url" 
                            className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-all"
                            value={form.youtubeUrl}
                            onChange={(e) => setForm({...form, youtubeUrl: e.target.value})}
                            placeholder="YouTube URL"
                        />
                    </div>
                </div>
                
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Display Order</label>
                    <input 
                        type="number" 
                        className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-teal transition-all"
                        value={form.order}
                        onChange={(e) => setForm({...form, order: parseInt(e.target.value)})}
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isUploading}
                        className="flex-1 bg-brand-teal text-white py-3 rounded-xl font-bold hover:bg-[#006066] disabled:opacity-50 shadow-lg shadow-brand-teal/20 transition-all"
                    >
                        {isSubmitting ? "Saving..." : (editingId ? "Update Profile" : "Add Member")}
                    </button>
                </div>
            </form>
        </Modal>

        <ConfirmModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Remove Team Member?"
            message="Are you sure you want to remove this person from the leadership team?"
        />
    </div>
  );
}