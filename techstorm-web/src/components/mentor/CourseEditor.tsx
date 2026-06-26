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
    status: course.status || "DRAFT",
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

            {activeTab === "settings" && (
                <div className="space-y-6">
                    {/* Status Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-brand-dark">Course Visibility</h3>
                                <p className="text-sm text-slate-500">Manage who can see and enroll in your course.</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {course.status || 'DRAFT'}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-50 pt-6">
                            <button 
                                onClick={(e) => { e.preventDefault(); setFormData({...formData, status: "DRAFT"}); }}
                                className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold transition-all text-left ${formData.status === 'DRAFT' ? 'border-brand-amber bg-brand-amber/5 text-brand-dark' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <i className={`fas fa-lock ${formData.status === 'DRAFT' ? 'text-brand-amber' : ''}`}></i>
                                    <span>Draft Mode</span>
                                </div>
                                <p className={`text-xs font-normal ${formData.status === 'DRAFT' ? 'text-slate-600' : 'text-slate-400'}`}>Hidden from public. Only you can view this.</p>
                            </button>
                            <button 
                                onClick={(e) => { e.preventDefault(); setFormData({...formData, status: "PUBLISHED"}); }}
                                className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold transition-all text-left ${formData.status === 'PUBLISHED' ? 'border-brand-teal bg-brand-teal/5 text-brand-dark' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <i className={`fas fa-globe ${formData.status === 'PUBLISHED' ? 'text-brand-teal' : ''}`}></i>
                                    <span>Published</span>
                                </div>
                                <p className={`text-xs font-normal ${formData.status === 'PUBLISHED' ? 'text-slate-600' : 'text-slate-400'}`}>Visible to all students. Ready for enrollment.</p>
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                        <h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-lg">Permanently remove this course and all its associated data, including student progress and quizzes. This action cannot be undone.</p>
                        
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                const confirmDelete = window.prompt(`Type "${course.title}" to confirm deletion:`);
                                if (confirmDelete === course.title) {
                                    // Hook up to backend deletion logic later
                                    toast.error("Delete functionality is currently disabled in this environment.");
                                } else if (confirmDelete !== null) {
                                    toast.error("Course name did not match.");
                                }
                            }}
                            className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <i className="fas fa-trash-alt"></i> Delete Course
                        </button>
                    </div>
                </div>
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
