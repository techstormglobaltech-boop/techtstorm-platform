"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/actions/user-management"; 
import { UserRole } from "@/types/user";
import toast from "react-hot-toast";

export default function InvitePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "MENTOR" as UserRole | "ADMIN"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call the same action we use for creating admins/users
    const result = await createUser({ 
        name: formData.name, 
        email: formData.email, 
        role: formData.role as UserRole 
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Invitation sent to ${formData.email}`);
      setFormData({ name: "", email: "", role: "MENTOR" });
      router.refresh();
    } else {
      toast.error(result.error || "Failed to send invitation");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-dark">Invite Team Member</h1>
        <p className="text-slate-500 mt-2">Send an invitation to join the TechStorm Global platform.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
              placeholder="e.g. Sarah Connor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
              placeholder="e.g. sarah@techstorm.global"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "MENTOR" })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.role === "MENTOR"
                    ? "border-brand-teal bg-brand-teal/5 ring-1 ring-brand-teal"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    formData.role === "MENTOR" ? "bg-brand-teal text-white" : "bg-slate-100 text-slate-400"
                }`}>
                    <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <div className="font-bold text-slate-800">Mentor</div>
                <div className="text-xs text-slate-500 mt-1">Can create courses & manage students.</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.role === "ADMIN"
                    ? "border-purple-600 bg-purple-50 ring-1 ring-purple-600"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    formData.role === "ADMIN" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                    <i className="fas fa-user-shield"></i>
                </div>
                <div className="font-bold text-slate-800">Administrator</div>
                <div className="text-xs text-slate-500 mt-1">Full access to platform settings & users.</div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex gap-3 items-start mb-6">
                <i className="fas fa-info-circle mt-1"></i>
                <p>The user will receive an email with a secure link to set up their password and activate their account.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                    <i className="fas fa-circle-notch fa-spin"></i> Sending Invitation...
                </>
              ) : (
                <>
                    <i className="fas fa-paper-plane"></i> Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
