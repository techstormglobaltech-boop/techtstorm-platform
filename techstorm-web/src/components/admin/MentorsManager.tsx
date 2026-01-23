"use client";
import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUser, toggleUserStatus } from "@/app/actions/user-management";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [editFormData, setEditFormData] = useState({ id: "", name: "", email: "", role: "MENTOR" });

  const filteredMentors = initialMentors.filter(mentor => 
    mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this mentor?")) {
      const result = await deleteUser(id);
      if (result.success) {
        toast.success("Mentor removed");
        startTransition(() => {
            router.refresh();
        });
      } else {
        toast.error("Failed to delete mentor");
      }
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
      role: mentor.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await updateUser(editFormData.id, { 
      name: editFormData.name, 
      email: editFormData.email, 
      role: editFormData.role as any 
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
    
    const result = await createUser({ ...formData, role: "MENTOR" });
    
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success("Mentor added successfully!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
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
                                    onClick={() => handleDelete(mentor.id)}
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-dark">Add New Mentor</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password (Optional)</label>
                        <input 
                            type="password" 
                            placeholder="Default: password123"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
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
                            className="flex-1 py-2.5 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Adding..." : "Add Mentor"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-dark">Edit Mentor</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal"
                            value={editFormData.role}
                            onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                        >
                            <option value="MENTOR">Mentor</option>
                            <option value="MENTEE">Mentee</option>
                            <option value="ADMIN">Admin</option>
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
                            className="flex-1 py-2.5 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}
