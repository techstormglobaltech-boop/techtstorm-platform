"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateProfile, updatePassword } from "@/app/actions/settings";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SettingsViewProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user.name || "",
    image: user.image || "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large (max 2MB)");
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
            setProfileForm(prev => ({ ...prev, image: data.url }));
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        const result = await updateProfile({
            name: profileForm.name,
            image: profileForm.image
        });
        
        if (result.success) {
            toast.success("Profile updated!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update profile");
        }
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
        toast.error("New passwords do not match");
        return;
    }

    if (passwordForm.new.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    startTransition(async () => {
        const result = await updatePassword({
            current: passwordForm.current,
            new: passwordForm.new
        });

        if (result.success) {
            toast.success("Password changed successfully!");
            setPasswordForm({ current: "", new: "", confirm: "" });
        } else {
            toast.error(result.error || "Failed to change password");
        }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Nav */}
      <div className="md:col-span-1 space-y-1">
        <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile" 
                ? "bg-brand-teal text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
        >
            <i className="fas fa-user-circle w-6 text-center mr-2"></i> Profile
        </button>
        <button
            onClick={() => setActiveTab("password")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "password" 
                ? "bg-brand-teal text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
        >
            <i className="fas fa-lock w-6 text-center mr-2"></i> Security
        </button>
      </div>

      {/* Main Content */}
      <div className="md:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
        
        {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Public Profile</h3>
                
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-100">
                        {profileForm.image ? (
                            <Image src={profileForm.image} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
                                <i className="fas fa-user"></i>
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                <i className="fas fa-spinner fa-spin"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                            Change Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                        <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            disabled
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                            value={user.email || ""}
                        />
                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button 
                        type="submit" 
                        disabled={isPending || isUploading}
                        className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#006066] transition-colors shadow-md disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        )}

        {activeTab === "password" && (
            <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Change Password</h3>
                
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-brand-teal focus:border-brand-teal outline-none"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#006066] transition-colors shadow-md disabled:opacity-50"
                    >
                        {isPending ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </form>
        )}

      </div>
    </div>
  );
}
