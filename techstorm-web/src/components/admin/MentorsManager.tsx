"use client";
import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUser, toggleUserStatus } from "@/app/actions/user-management";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserRole } from "@/types/user";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface MentorsManagerProps {
  initialMentors: any[];
}

export default function MentorsManager({ initialMentors }: MentorsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editFormData, setEditFormData] = useState({ id: "", name: "", email: "", role: UserRole.MENTOR });

  const filteredMentors = initialMentors.filter(mentor => 
    mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    const result = await deleteUser(deleteId);
    if (result.success) {
      toast.success("Mentor removed");
      setDeleteId(null);
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error("Failed to delete mentor");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const result = await toggleUserStatus(id, currentStatus);
    if (result.success) {
      toast.success(`User ${result.newStatus === "ACTIVE" ? "activated" : "suspended"}`);
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (mentor: any) => {
    setEditFormData({
      id: mentor.id,
      name: mentor.name || "",
      email: mentor.email,
      role: mentor.role as UserRole
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await updateUser(editFormData.id, { 
      name: editFormData.name, 
      email: editFormData.email, 
      role: editFormData.role 
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success("Mentor updated successfully!");
      setIsEditModalOpen(false);
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error(result.error || "An error occurred");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await createUser({ ...formData, role: UserRole.MENTOR });
    
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success("Invitation sent successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "" });
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error(result.error || "An error occurred");
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Mentors</h1>
          <p className="text-slate-500 mt-1">Manage your teaching staff.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#006066] transition-colors shadow-sm flex items-center gap-2"
        >
            <i className="fas fa-plus"></i> Add New Mentor
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                placeholder="Search mentors..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-5">Name</th>
                    <th className="p-5">Email</th>
                    <th className="p-5">Courses</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Joined</th>
                    <th className="p-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold">
                                    {mentor.name?.[0] || "M"}
                                </div>
                                <span className="font-semibold text-brand-dark">{mentor.name || "Unknown"}</span>
                            </div>
                        </td>
                        <td className="p-5 text-slate-600">{mentor.email}</td>
                        <td className="p-5">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                                {mentor._count?.coursesTeaching || 0} Courses
                            </span>
                        </td>
                        <td className="p-5">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                mentor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {mentor.status}
                            </span>
                        </td>
                        <td className="p-5 text-slate-500 text-sm">
                            {new Date(mentor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-5 text-right">
                            <div className="flex justify-end items-center gap-2">
                                <button 
                                    onClick={() => handleEdit(mentor)}
                                    className="text-slate-400 hover:text-brand-teal p-2 rounded hover:bg-slate-100 transition-colors"
                                    title="Edit User"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={() => handleToggleStatus(mentor.id, mentor.status)}
                                    className={`${mentor.status === 'ACTIVE' ? 'text-amber-400 hover:text-amber-600' : 'text-green-400 hover:text-green-600'} p-2 rounded hover:bg-slate-100 transition-colors`}
                                    title={mentor.status === 'ACTIVE' ? "Suspend User" : "Activate User"}
                                >
                                    <i className={`fas ${mentor.status === 'ACTIVE' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(mentor.id)}
                                    className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors"
                                    title="Delete User"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredMentors.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-400">No mentors found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Add Mentor Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Invite New Mentor"
      >
        <form onSubmit={handleCreate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                />
            </div>
            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2 items-start">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>The mentor will receive an email invitation to set their own password and activate their account.</p>
            </div>
            <div className="pt-2 flex gap-3">
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50 shadow-lg shadow-brand-teal/20"
                >
                    {isSubmitting ? "Sending..." : "Send Invitation"}
                </button>
            </div>
        </form>
      </Modal>

      {/* Edit Mentor Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Mentor"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value as UserRole})}
                >
                    <option value={UserRole.MENTOR}>Mentor</option>
                    <option value={UserRole.MENTEE}>Mentee</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                </select>
            </div>
            <div className="pt-2 flex gap-3">
                <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50 shadow-lg shadow-brand-teal/20"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove Mentor?"
        message="This action cannot be undone. The mentor account and their data will be permanently removed."
      />

    </div>
  );
}
