"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateCourseDetails } from "@/app/actions/course-edit";
import { useRouter } from "next/navigation";
import CurriculumEditor from "@/components/mentor/CurriculumEditor";
import toast from "react-hot-toast";

interface CourseEditorProps {
  course: any;
}

export default function CourseEditor({ course }: CourseEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: course.title || "",
    description: course.description || "",
    price: course.price || "",
    category: course.category || "Programming",
    image: course.image || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateCourseDetails(course.id, formData);
    setIsSaving(false);

    if (result.success) {
      toast.success("Course updated successfully!");
      router.refresh();
    } else {
      toast.error("Failed to save changes.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Thumbnail uploaded!");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-dark">Edit Course</h1>
        <div className="flex gap-3">
            <Link 
                href={`/learn/${course.id}`}
                target="_blank"
                className="text-slate-500 hover:text-brand-dark px-4 py-2 text-sm flex items-center gap-2"
            >
                <i className="fas fa-eye"></i> Preview
            </Link>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-[#006066] transition-colors disabled:opacity-50 shadow-sm"
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        {["details", "curriculum", "settings"].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab 
                    ? "border-brand-teal text-brand-teal" 
                    : "border-transparent text-slate-500 hover:text-brand-dark"
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
            {activeTab === "details" && (
                <form id="course-form" className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Course Title</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                        <textarea 
                            rows={6}
                            className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                            <select 
                                className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Programming">Programming</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Price (GH₵)</label>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                    </div>
                </form>
            )}

            {activeTab === "curriculum" && (
                <CurriculumEditor course={course} />
            )}
        </div>

        {/* Sidebar / Asset Upload */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-4">Course Thumbnail</h3>
                <label className="aspect-video bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-brand-teal transition-colors cursor-pointer">
                    {uploading ? (
                        <div className="flex flex-col items-center text-brand-teal">
                            <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
                            <span className="text-xs">Uploading...</span>
                        </div>
                    ) : formData.image ? (
                        <Image src={formData.image} alt="Thumbnail" fill className="object-cover" />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center">
                            <i className="fas fa-cloud-upload-alt text-3xl mb-2 group-hover:scale-110 transition-transform"></i>
                            <span className="text-xs group-hover:text-brand-teal transition-colors">Click to upload</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                </label>
                <p className="text-xs text-slate-500 mt-2 text-center">Supported: JPG, PNG, WEBP (Max 5MB)</p>
            </div>
        </div>

      </div>
    </div>
  );
}
