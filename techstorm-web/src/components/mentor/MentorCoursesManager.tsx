"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { createCourse, deleteCourse, generateAICourse, toggleCourseStatus } from "@/app/actions/course";
import { inviteStudent } from "@/app/actions/invitations";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";

interface MentorCoursesManagerProps {
  initialCourses: any[];
}

export default function MentorCoursesManager({ initialCourses }: MentorCoursesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseForInvite, setSelectedCourseCourseForInvite] = useState<{id: string, title: string} | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; courseId: string | null }>({
    isOpen: false,
    courseId: null,
  });

  // Form Data
  const [title, setTitle] = useState("");
  const [aiTopic, setAiTopic] = useState("");

  const filteredCourses = initialCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const result = await toggleCourseStatus(id, currentStatus);
    if (result.success) {
      toast.success(result.newStatus === "PUBLISHED" ? "Course Published!" : "Course Unpublished");
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error("Failed to update status");
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
    const result = await generateAICourse(aiTopic, "Intermediate");
    setIsLoading(false);

    if (result.success) {
      toast.success("AI has drafted your course!");
      setIsModalOpen(false);
      setAiTopic("");
      startTransition(() => {
          router.refresh();
      });
    } else {
      toast.error(result.error || "Failed to generate AI course");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForInvite || !inviteEmail) return;

    setIsLoading(true);
    const result = await inviteStudent(selectedCourseForInvite.id, inviteEmail);
    setIsLoading(false);

    if (result.success) {
        toast.success("Invitation email sent!");
        setIsInviteModalOpen(false);
        setInviteEmail("");
    } else {
        toast.error(result.error || "Failed to send invitation");
    }
  };

  const openModal = (tab: "manual" | "ai") => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-brand-dark">My Courses</h1>
            <p className="text-slate-500 mt-1">Manage and update your teaching content.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => openModal("ai")}
                disabled={isLoading}
                className="bg-brand-amber text-brand-dark px-5 py-2.5 rounded-lg font-bold hover:bg-[#e6a200] transition-colors shadow-lg shadow-brand-amber/10 flex items-center gap-2 disabled:opacity-50"
            >
                <i className={`fas ${isLoading && activeTab === 'ai' ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i> 
                {isLoading && activeTab === 'ai' ? "AI Drafting..." : "AI Draft"}
            </button>
            <button 
                onClick={() => openModal("manual")}
                disabled={isLoading}
                className="bg-brand-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#006066] transition-colors shadow-lg shadow-brand-teal/20 flex items-center gap-2 disabled:opacity-50"
            >
                <i className="fas fa-plus"></i> New Course
            </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                placeholder="Search your courses..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-brand-dark focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Course List */}
      <div className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                    <th className="p-5 pl-6">Course Details</th>
                    <th className="p-5">Students</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-5 pl-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-100 relative">
                                    {course.image ? (
                                        <Image src={course.image} alt={course.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-brand-dark group-hover:text-brand-teal transition-colors">{course.title}</div>
                                    <div className="text-xs text-slate-400">{course.category || "General"}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-5 font-medium">{course._count?.enrollments || 0} enrolled</td>
                        <td className="p-5">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {course.status}
                            </span>
                        </td>
                        <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                                <button 
                                    onClick={() => handleToggleStatus(course.id, course.status)}
                                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                                        course.status === 'PUBLISHED' 
                                        ? 'border-green-200 text-green-600 hover:bg-green-50' 
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                                    title={course.status === 'PUBLISHED' ? "Unpublish" : "Publish"}
                                >
                                    {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button 
                                    onClick={() => {
                                        setSelectedCourseCourseForInvite({ id: course.id, title: course.title });
                                        setIsInviteModalOpen(true);
                                    }}
                                    className="text-slate-400 hover:text-brand-teal transition-colors flex items-center justify-center" 
                                    title="Invite Student"
                                >
                                    <i className="fas fa-user-plus"></i>
                                </button>
                                <Link 
                                    href={`/mentor/courses/${course.id}`}
                                    className="text-slate-400 hover:text-brand-teal transition-colors flex items-center justify-center" 
                                    title="Edit Content"
                                >
                                    <i className="fas fa-edit"></i>
                                </Link>
                                <Link 
                                    href={`/mentor/courses/${course.id}/submissions`}
                                    className="text-slate-400 hover:text-brand-amber transition-colors flex items-center justify-center relative" 
                                    title="Student Submissions"
                                >
                                    <i className="fas fa-file-invoice"></i>
                                </Link>
                                <button 
                                    onClick={() => setConfirmDelete({ isOpen: true, courseId: course.id })}
                                    className="text-slate-400 hover:text-red-500 transition-colors" 
                                    title="Delete"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredCourses.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-400">
                            No courses found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* CREATE COURSE MODAL (LIGHT THEME) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header & Tabs */}
                <div className="bg-slate-50 border-b border-slate-200">
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
                                activeTab === "manual" ? "border-brand-teal text-brand-teal" : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <i className="fas fa-edit mr-2"></i> Manual
                        </button>
                        <button 
                            onClick={() => setActiveTab("ai")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "ai" ? "border-brand-amber text-brand-amber" : "border-transparent text-slate-400 hover:text-slate-600"
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
                                <label className="block text-sm font-medium text-slate-600 mb-1">Course Title</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Advanced React Patterns"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 mt-1">You can add modules and lessons later.</p>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-500 font-medium rounded-lg hover:bg-slate-50 transition-colors"
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
                            <div className="bg-brand-amber/10 border border-brand-amber/20 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-800 flex gap-2">
                                    <i className="fas fa-lightbulb mt-0.5 text-brand-amber"></i>
                                    <span>Describe your topic, and our AI will generate a complete course structure with modules and lessons for you.</span>
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">What do you want to teach?</label>
                                <textarea 
                                    required
                                    rows={3}
                                    placeholder="e.g. A complete guide to Python for Data Science..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-amber/10 focus:border-brand-amber outline-none transition-all resize-none"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-500 font-medium rounded-lg hover:bg-slate-50 transition-colors"
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

      {/* INVITE MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-brand-dark">Invite Mentee</h3>
                    <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-500 mb-4">
                        Send an invitation to <span className="font-bold text-brand-dark">{selectedCourseForInvite?.title}</span>.
                    </p>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                placeholder="student@example.com"
                                className="w-full px-4 py-2 bg-white border border-slate-200 text-brand-dark rounded-lg focus:ring-2 focus:ring-brand-teal/10 focus:border-brand-teal outline-none transition-all"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setIsInviteModalOpen(false)}
                                className="flex-1 py-2.5 border border-slate-200 text-slate-500 font-medium rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="flex-1 py-2.5 bg-brand-teal text-white font-medium rounded-lg hover:bg-[#006066] disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <><i className="fas fa-circle-notch fa-spin"></i> Sending...</>
                                ) : (
                                    "Send Invitation"
                                )}
                            </button>
                        </div>
                    </form>
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
        message="This action cannot be undone. All your module and lesson data for this course will be lost."
      />

    </div>
  );
}