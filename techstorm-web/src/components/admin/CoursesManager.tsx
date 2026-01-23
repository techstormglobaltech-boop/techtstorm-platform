"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { createCourse, deleteCourse, generateAICourse } from "@/app/actions/course";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface CoursesManagerProps {
  initialCourses: any[];
}

export default function CoursesManager({ initialCourses }: CoursesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [isLoading, setIsLoading] = useState(false);
  
  // Confirm Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; courseId: string | null }>({
    isOpen: false,
    courseId: null,
  });
  
  // Form Data
  const [title, setTitle] = useState("");
  const [aiTopic, setAiTopic] = useState("");

  // Filter Logic
  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (course.instructor.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!confirmDelete.courseId) return;
    
    const result = await deleteCourse(confirmDelete.courseId);
    if (result.success) {
      toast.success("Course deleted successfully");
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error("Failed to delete course");
    }
  };

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsLoading(true);
    const result = await createCourse(title);
    setIsLoading(false);

    if (result.success) {
      toast.success("Course created successfully!");
      setIsModalOpen(false);
      setTitle("");
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error("Failed to create course");
    }
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic) return;

    setIsLoading(true);
    const result = await generateAICourse(aiTopic, "Beginner");
    setIsLoading(false);

    if (result.success) {
      toast.success("AI has generated your course draft!");
      setIsModalOpen(false);
      setAiTopic("");
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error(result.error || "Failed to generate AI course");
    }
  };

  const openModal = (tab: "manual" | "ai") => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Course Management</h1>
          <p className="text-slate-500 mt-1">Review, approve, and manage LMS content.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => openModal("ai")}
                className="bg-brand-amber text-brand-dark px-5 py-2.5 rounded-lg font-bold hover:bg-[#e6a200] transition-colors shadow-sm flex items-center gap-2"
            >
                <i className="fas fa-magic"></i> AI Generate
            </button>
            <button 
                onClick={() => openModal("manual")}
                className="bg-brand-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#006066] transition-colors shadow-sm flex items-center gap-2"
            >
                <i className="fas fa-plus"></i> Manual Add
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                placeholder="Search courses or instructors..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
            <select 
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-teal bg-white text-slate-600"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">In Review</option>
            </select>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <i className="fas fa-filter"></i> <span className="hidden sm:inline">Filter</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-5">Course</th>
                        <th className="p-5">Instructor</th>
                        <th className="p-5">Content</th>
                        <th className="p-5">Students</th>
                        <th className="p-5">Status</th>
                        <th className="p-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-200 relative">
                                            {course.image ? (
                                                <Image src={course.image} alt={course.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <i className="fas fa-image"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-brand-dark group-hover:text-brand-teal transition-colors text-sm">{course.title}</div>
                                            <div className="text-xs text-brand-amber font-semibold uppercase tracking-wide">
                                                {course.category || "Uncategorized"} • {course.price ? `GH₵${course.price}` : "Free"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="text-sm font-medium text-slate-700">{course.instructor?.name || course.instructor?.email || "Unknown"}</div>
                                </td>
                                <td className="p-5">
                                    <div className="text-xs text-slate-600">
                                        <div className="flex items-center gap-2"><i className="fas fa-layer-group w-4"></i> {course._count?.modules || 0} Modules</div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-users text-slate-400 text-xs"></i>
                                        <span className="text-sm font-medium text-slate-700">{course._count?.enrollments || 0}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                        course.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link 
                                            href={`/mentor/courses/${course.id}`}
                                            className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-brand-teal hover:bg-slate-100 transition-colors" 
                                            title="Edit Content"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button 
                                            className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" 
                                            title="Delete"
                                            onClick={() => setConfirmDelete({ isOpen: true, courseId: course.id })}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-400">
                                <div className="mb-2 text-4xl opacity-20"><i className="fas fa-book-open"></i></div>
                                <p>No courses found.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* CREATE COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header & Tabs */}
                <div className="bg-slate-50 border-b border-slate-100">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-brand-dark">Create New Course</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="flex px-6 gap-6">
                        <button 
                            onClick={() => setActiveTab("manual")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "manual" ? "border-brand-teal text-brand-teal" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <i className="fas fa-edit mr-2"></i> Manual
                        </button>
                        <button 
                            onClick={() => setActiveTab("ai")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "ai" ? "border-brand-amber text-brand-amber" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <i className="fas fa-magic mr-2"></i> AI Assistant
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {activeTab === "manual" ? (
                        <form onSubmit={handleManualCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Advanced React Patterns"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 mt-1">You can add modules and lessons later.</p>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? (
                                        <><i className="fas fa-circle-notch fa-spin"></i> Creating...</>
                                    ) : (
                                        "Create Draft"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAiGenerate} className="space-y-4">
                            <div className="bg-amber-50 border border-brand-amber/20 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-800 flex gap-2">
                                    <i className="fas fa-lightbulb mt-0.5"></i>
                                    <span>Describe your topic, and our AI will generate a complete course structure with modules and lessons for you.</span>
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">What do you want to teach?</label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="e.g. A complete guide to Python for Data Science, covering Pandas, NumPy, and basic Machine Learning models."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none transition-all resize-none"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-brand-amber text-brand-dark font-bold rounded-lg hover:bg-[#e6a200] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? (
                                        <><i className="fas fa-spinner fa-spin"></i> Generating...</>
                                    ) : (
                                        <><i className="fas fa-magic"></i> Generate Course</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, courseId: null })}
        onConfirm={handleDelete}
        title="Delete Course?"
        message="This action cannot be undone. All modules and lessons associated with this course will be permanently removed."
      />

    </div>
  );
}
