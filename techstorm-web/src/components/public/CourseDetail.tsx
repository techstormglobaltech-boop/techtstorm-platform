"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { enrollInCourse } from "@/app/actions/enrollment";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useRouter } from "next/navigation";

interface CourseDetailProps {
  course: any; 
  isEnrolled?: boolean;
}

export default function CourseDetail({ course, isEnrolled: initialIsEnrolled }: CourseDetailProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!course) return <div>Course not found</div>;

  const handleEnrollClick = () => {
    if (isEnrolled) {
        router.push(`/learn/${course.id}`);
        return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmEnroll = async () => {
    setIsConfirmOpen(false);
    setIsEnrolling(true);
    
    const result = await enrollInCourse(course.id);
    
    if (result.error === "UNAUTHORIZED") {
        router.push(`/login?callbackUrl=/courses/${course.id}`);
        return;
    }

    if (result.success) {
      toast.success(result.alreadyEnrolled ? "You are already enrolled!" : "Welcome to the course!");
      setIsEnrolled(true);
      if (!result.alreadyEnrolled) {
          router.push(`/learn/${course.id}`);
      }
    } else {
      toast.error("Enrollment failed. Please try again.");
    }
    setIsEnrolling(false);
  };

  return (
    <>
      {/* HERO HEADER */}
      <section className="bg-brand-dark text-white pt-32 pb-20">
        <div className="container mx-auto px-5 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
                <Reveal>
                    <div className="flex items-center gap-2 text-sm text-brand-amber mb-4 font-semibold uppercase tracking-wider">
                        <span>{course.category || "General"}</span>
                        <i className="fas fa-chevron-right text-xs text-slate-500"></i>
                        <span className="text-slate-300">Course Detail</span>
                    </div>
                </Reveal>
                <Reveal delay={100}>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
                </Reveal>
                <Reveal delay={200}>
                    <p className="text-lg text-slate-300 mb-6 max-w-2xl">{course.description || "No description available."}</p>
                </Reveal>
                
                <Reveal delay={300}>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-brand-amber">
                            {/* Static rating for now */}
                            <span className="font-bold">4.8</span>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star-half-alt"></i>
                            <span className="text-slate-400 ml-1 underline">({course._count?.enrollments || 0} enrolled)</span>
                        </div>
                        <div className="text-slate-300">
                            <i className="fas fa-user-graduate mr-2"></i> {course._count?.enrollments || 0} students
                        </div>
                        <div className="text-slate-300">
                            <i className="fas fa-clock mr-2"></i> Created {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </Reveal>
                
                <Reveal delay={400}>
                    <div className="mt-8 flex items-center gap-3">
                        {course.instructor?.image ? (
                             <Image src={course.instructor.image} alt={course.instructor.name || "Instructor"} width={40} height={40} className="rounded-full border-2 border-brand-teal" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold">
                                {course.instructor?.name?.[0] || "T"}
                            </div>
                        )}
                        <div>
                            <p className="text-slate-400 text-xs">Created by</p>
                            <p className="font-semibold text-white">{course.instructor?.name || "TechStorm Mentor"}</p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
      </section>

      {/* CONTENT & SIDEBAR */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-5 grid lg:grid-cols-3 gap-10 relative">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-2 space-y-10">
                
                {/* Curriculum */}
                <Reveal width="100%" delay={100}>
                    <div>
                        <h3 className="text-2xl font-bold text-brand-dark mb-6">Course Content</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                            {course.modules?.map((module: any, i: number) => (
                                <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <i className="fas fa-chevron-down text-slate-400 group-hover:text-brand-teal transition-colors"></i>
                                        <span className="font-semibold text-brand-dark">{module.title}</span>
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {module.lessons?.length || 0} lessons
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* Instructor */}
                <Reveal width="100%" delay={200}>
                    <div>
                        <h3 className="text-2xl font-bold text-brand-dark mb-6">Instructor</h3>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                {course.instructor?.image ? (
                                    <Image src={course.instructor.image} alt={course.instructor.name} width={80} height={80} className="rounded-full" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-2xl">
                                        {course.instructor?.name?.[0] || "T"}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-lg font-bold text-brand-dark">{course.instructor?.name || "TechStorm Mentor"}</h4>
                                    <p className="text-brand-teal text-sm">Mentor</p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                Experienced mentor at TechStorm.
                            </p>
                        </div>
                    </div>
                </Reveal>

            </div>

            {/* RIGHT SIDEBAR (Sticky) */}
            <div className="lg:col-span-1">
                <div className="sticky top-24">
                    <Reveal width="100%">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                            {/* Video Placeholder */}
                            <div className="h-48 bg-slate-900 relative flex items-center justify-center group cursor-pointer">
                                {course.image ? (
                                    <Image src={course.image} alt={course.title} fill className="object-cover opacity-60" />
                                ) : null}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-play text-brand-teal text-xl ml-1"></i>
                                </div>
                                <span className="absolute bottom-4 text-white font-semibold text-sm z-10">Preview this course</span>
                            </div>

                            <div className="p-8">
                                <div className="text-3xl font-bold text-brand-dark mb-2">{course.price ? `GH₵${course.price}` : "Free"}</div>
                                
                                <button 
                                    onClick={handleEnrollClick}
                                    disabled={isEnrolling}
                                    className={`block w-full text-white text-center font-bold py-3.5 rounded-lg transition-all shadow-md mb-4 disabled:opacity-50 ${
                                        isEnrolled ? 'bg-brand-dark hover:bg-black' : 'bg-brand-teal hover:bg-[#006066]'
                                    }`}
                                >
                                    {isEnrolling ? "Processing..." : isEnrolled ? "Go to Course" : "Enroll Now"}
                                </button>

                                <p className="text-center text-xs text-slate-500 mb-6">Full Lifetime Access</p>
                                
                                <div className="space-y-4">
                                    <h5 className="font-bold text-brand-dark text-sm">This course includes:</h5>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex items-center gap-3"><i className="fas fa-video w-5 text-center text-slate-400"></i> On-demand video</li>
                                        <li className="flex items-center gap-3"><i className="fas fa-mobile-alt w-5 text-center text-slate-400"></i> Access on mobile</li>
                                        <li className="flex items-center gap-3"><i className="fas fa-certificate w-5 text-center text-slate-400"></i> Certificate of completion</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>

        </div>
      </section>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmEnroll}
        title="Confirm Enrollment"
        message={`Are you sure you want to enroll in "${course.title}"? You will get instant access to all course materials.`}
        confirmText="Enroll Now"
        variant="teal"
      />
    </>
  );
}
