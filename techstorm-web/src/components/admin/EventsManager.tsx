"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { createEvent, deleteEvent, editEvent } from "@/app/actions/events";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

interface EventsManagerProps {
  initialEvents: any[];
}

export default function EventsManager({ initialEvents }: EventsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    isVirtual: false,
    image: ""
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredEvents = initialEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (event: any) => {
    setEditingId(event.id);
    setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().slice(0, 16), // Format for datetime-local
        location: event.location,
        isVirtual: event.isVirtual,
        image: event.image || ""
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", date: "", location: "", isVirtual: false, image: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (editingId) {
        result = await editEvent(editingId, formData);
    } else {
        result = await createEvent(formData);
    }
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success(editingId ? "Event updated!" : "Event created!");
      setIsModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error(result.error || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    const result = await deleteEvent(confirmDelete.id);
    if (result.success) {
      toast.success("Event deleted");
      setConfirmDelete({ isOpen: false, id: null });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Events Management</h1>
          <p className="text-slate-500 mt-1">Create and manage your organization's events.</p>
        </div>
        <button 
            onClick={openCreateModal}
            className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#006066] transition-all shadow-md flex items-center gap-2"
        >
            <i className="fas fa-plus"></i> Add New Event
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
            <tr>
              <th className="p-5">Event Title</th>
              <th className="p-5">Date</th>
              <th className="p-5">Location</th>
              <th className="p-5">Type</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                <motion.tr 
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors group"
                >
                    <td className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                                {event.image ? (
                                    <Image src={event.image} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-300">
                                        <i className="fas fa-calendar text-[10px]"></i>
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-brand-dark">{event.title}</span>
                        </div>
                    </td>
                    <td className="p-5 text-slate-600">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-5 text-slate-500 truncate max-w-[200px]">{event.location}</td>
                    <td className="p-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${event.isVirtual ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {event.isVirtual ? 'Virtual' : 'On-Site'}
                        </span>
                    </td>
                    <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => openEditModal(event)}
                                className="text-slate-300 hover:text-brand-teal transition-colors p-2"
                                title="Edit"
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                            <button 
                                onClick={() => setConfirmDelete({ isOpen: true, id: event.id })}
                                className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                title="Delete"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </motion.tr>
                ))}
            </AnimatePresence>
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Event" : "Create New Event"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Event Title</label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. AI in Africa Webinar"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Event Thumbnail</label>
                <div className="relative aspect-video w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden group hover:border-brand-teal transition-colors cursor-pointer">
                    {isUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                            <i className="fas fa-spinner fa-spin text-brand-teal text-xl mb-2"></i>
                            <span className="text-[10px] font-bold text-brand-teal uppercase">Uploading...</span>
                        </div>
                    ) : null}
                    
                    {formData.image ? (
                        <div className="relative w-full h-full">
                            <Image src={formData.image} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-brand-dark/50 px-3 py-1 rounded-full">Change Image</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-4 text-slate-400 group-hover:text-brand-teal">
                            <i className="fas fa-cloud-upload-alt text-2xl mb-1"></i>
                            <p className="text-[10px] font-bold uppercase">Click to upload</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</label>
                <input 
                    type="datetime-local" 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Location or Link</label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. Accra Digital Centre or Zoom Link"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input 
                    type="checkbox" 
                    id="isVirtual"
                    className="w-4 h-4 accent-brand-teal"
                    checked={formData.isVirtual}
                    onChange={(e) => setFormData({...formData, isVirtual: e.target.checked})}
                />
                <label htmlFor="isVirtual" className="text-sm font-bold text-slate-700 cursor-pointer">This is a virtual event</label>
            </div>
            <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                    rows={4} 
                    required
                    placeholder="Tell people what the event is about..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-50 text-slate-500 font-bold rounded-lg hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] shadow-md shadow-brand-teal/10 disabled:opacity-50">
                    {isSubmitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Event" : "Create Event")}
                </button>
            </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        title="Delete Event?"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
}