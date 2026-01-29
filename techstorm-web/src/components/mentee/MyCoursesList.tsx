"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { leaveCourse } from "@/app/actions/learning";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface MyCoursesListProps {
  initialCourses: any[];
}

export default function MyCoursesList({ initialCourses }: MyCoursesListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("In Progress");
  const [courseToLeave, setCourseToLeave] = useState<string | null>(null);

  const filteredCourses = initialCourses.filter(course => {
    if (activeTab === "All") return true;
    if (activeTab === "In Progress") return course.progress < 100;
    if (activeTab === "Completed") return course.progress === 100;
    return true;
  });

  const handleLeaveCourse = async () => {
    if (!courseToLeave) return;

    const result = await leaveCourse(courseToLeave);
    setCourseToLeave(null);

    if (result.success) {
        toast.success("You have left the course.");
        startTransition(() => router.refresh());
    } else {
        toast.error("Failed to leave course.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-brand-dark">My Learning</h1>
            <p className="text-slate-500 mt-1">Pick up where you left off.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {["In Progress", "Completed", "All"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === tab 
                        ? "bg-white text-brand-teal shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
                <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group relative">
                    <div className="relative h-48 bg-slate-200">
                        {course.image ? (
                            <Image src={course.image} alt={course.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <i className="fas fa-image text-4xl"></i>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10"></div>
                        
                        {/* Status Badges */}
                        {course.progress === 100 && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <i className="fas fa-check-circle"></i> Completed
                            </div>
                        )}

                        {/* Leave Course Button */}
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                setCourseToLeave(course.id);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                            title="Unenroll from Course"
                        >
                            <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-brand-dark text-lg mb-2 leading-snug line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-slate-500 mb-4">Instructor: {course.instructor?.name || "TechStorm Mentor"}</p>
                        
                        <div className="mt-auto space-y-4">
                            {/* Progress Section */}
                            <div>
                                <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-brand-teal'}`} 
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Button */}
                            {course.progress === 100 ? (
                                <button className="w-full py-2.5 border border-brand-teal text-brand-teal font-semibold rounded-lg hover:bg-brand-teal hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <i className="fas fa-certificate"></i> View Certificate
                                </button>
                            ) : (
                                <Link 
                                    href={`/learn/${course.id}`} 
                                    className="block w-full py-2.5 bg-brand-dark text-white font-semibold text-center rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Continue Learning
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="text-4xl mb-3"><i className="fas fa-book-open"></i></div>
                <p>No courses found in this category.</p>
                <Link href="/courses" className="text-brand-teal font-semibold hover:underline mt-2 inline-block">Browse Catalog</Link>
            </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!courseToLeave}
        onClose={() => setCourseToLeave(null)}
        onConfirm={handleLeaveCourse}
        title="Leave Course?"
        message="Are you sure you want to unenroll? Your progress will be saved if you rejoin later."
        confirmText="Yes, Unenroll"
      />
    </div>
  );
}
