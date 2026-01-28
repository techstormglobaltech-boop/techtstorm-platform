"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import FileUploader from "@/components/ui/FileUploader";

function SetupContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    title: "",
    bio: "",
    image: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/setup-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            token, 
            password: formData.password, 
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            image: formData.image,
            linkedinUrl: formData.linkedinUrl,
            githubUrl: formData.githubUrl
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to setup account");

      toast.success("Account setup complete! Redirecting...");
      
      setTimeout(() => {
        router.push("/login?setup=success");
      }, 1500);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return <div className="text-center p-10 text-red-500">Invalid Invitation Link</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Setup Your Profile</h2>
          <p className="text-slate-500 mt-2">Finish setting up your account to join the TechStorm Global Team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PHOTO UPLOAD */}
          <div className="flex flex-col items-center gap-4 py-4 border-b border-slate-100">
             <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                {formData.image ? (
                    <Image src={formData.image} alt="Profile" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-slate-300">
                        <i className="fas fa-user"></i>
                    </div>
                )}
             </div>
             <div className="w-full max-w-xs">
                <FileUploader 
                    label="Upload Profile Photo"
                    bucket="course-content"
                    accept="image/*"
                    onUploadComplete={(url) => setFormData({ ...formData, image: url })}
                />
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Enter your name"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="e.g. AI Researcher"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biography</label>
            <textarea
              rows={3}
              required
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              placeholder="A brief bio about your expertise..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="https://linkedin.com/in/..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub URL</label>
                <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="https://github.com/..."
                />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100"></div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="••••••••"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="••••••••"
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all shadow-lg transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Complete Setup & Join Team"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}