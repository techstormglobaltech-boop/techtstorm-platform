"use client";

import { useState } from "react";
import { updateMyProfile } from "@/app/actions/profile";
import toast from "react-hot-toast";
import Image from "next/image";
import FileUploader from "@/components/ui/FileUploader";

interface ProfileSettingsFormProps {
  initialData: any;
}

export default function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    bio: initialData?.bio || "",
    image: initialData?.image || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    githubUrl: initialData?.githubUrl || "",
    twitterUrl: initialData?.twitterUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateMyProfile(formData);
    setIsSaving(false);

    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Photo */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-brand-dark mb-4">Profile Photo</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
            {formData.image ? (
              <Image src={formData.image} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="flex-1 w-full">
            <FileUploader 
              label="Upload New Photo"
              bucket="course-content" // Reusing same bucket or you can create 'profiles'
              accept="image/*"
              onUploadComplete={(url) => setFormData({ ...formData, image: url })}
            />
            <p className="text-xs text-slate-400 mt-2">Recommended: Square JPG or PNG, max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-brand-dark mb-2">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Job Title</label>
            <input 
              type="text" 
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Biography</label>
          <textarea 
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-brand-dark mb-2">Social Profiles</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <i className="fab fa-linkedin-in"></i>
            </div>
            <input 
              type="url" 
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <i className="fab fa-github"></i>
            </div>
            <input 
              type="url" 
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
              <i className="fab fa-twitter"></i>
            </div>
            <input 
              type="url" 
              placeholder="https://twitter.com/username"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/10 outline-none"
              value={formData.twitterUrl}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-brand-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-[#006066] transition-all shadow-md disabled:opacity-50"
        >
          {isSaving ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
