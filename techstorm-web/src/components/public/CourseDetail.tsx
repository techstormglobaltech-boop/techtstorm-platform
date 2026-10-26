"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { enrollInCourse } from "@/app/actions/enrollment";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CourseDetailProps {
  course: any; 
  isEnrolled?: boolean;
  enrollmentStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  initialPaymentRef?: string | null;
}

export default function CourseDetail({ 
  course, 
  isEnrolled: initialIsEnrolled,
  enrollmentStatus,
  initialPaymentRef,
}: CourseDetailProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled ?? false);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(
    enrollmentStatus || (initialIsEnrolled ? "APPROVED" : null)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentRefInput, setPaymentRefInput] = useState(initialPaymentRef || "");
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  if (!course) return <div className="p-10 text-center text-slate-500">Course not found</div>;

  const isPaid = typeof course.price === "number" && course.price > 0;

  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
        prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleEnrollClick = () => {
    if (status === "APPROVED" || isEnrolled) {
        router.push(`/learn/${course.id}`);
        return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmEnroll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isPaid && !paymentRefInput.trim()) {
      toast.error("Please enter your Payment / MoMo Reference ID to submit your enrollment request.");
      return;
    }
    setIsModalOpen(false);
    setIsEnrolling(true);
    
    const result = await enrollInCourse(course.id, paymentRefInput.trim() || undefined);
    
    if (result.error === "UNAUTHORIZED") {
        router.push(`/login?callbackUrl=/courses/${course.id}`);
        return;
    }

    if (result.success) {
      if (result.status === "PENDING") {
        toast.success("Enrollment request submitted! Waiting for instructor approval.");
        setStatus("PENDING");
      } else {
        toast.success(result.alreadyEnrolled ? "You are already enrolled!" : "Welcome to the course!");
        setIsEnrolled(true);
        setStatus("APPROVED");
        if (!result.alreadyEnrolled) {
            router.push(`/learn/${course.id}`);
        }
      }
    } else {
      toast.error(result.error || "Enrollment failed. Please try again.");
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
                            {course.modules?.map((module: any, i: number) => {
                                const isExpanded = expandedModules.includes(module.id);
                                return (
                                    <div key={module.id} className="flex flex-col">
                                        <div 
                                            onClick={() => toggleModule(module.id)}
                                            className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <motion.i 
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    className="fas fa-chevron-down text-slate-400 group-hover:text-brand-teal transition-colors"
                                                ></motion.i>
                                                <span className="font-semibold text-brand-dark">{module.title}</span>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {module.lessons?.length || 0} lessons
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden bg-slate-50/50"
                                                >
                                                    <div className="px-5 pb-5 pt-2 space-y-3">
                                                        {module.lessons?.map((lesson: any) => (
                                                            <div key={lesson.id} className="flex items-center gap-3 text-sm text-slate-600 pl-8">
                                                                <i className="far fa-play-circle text-brand-teal/60"></i>
                                                                <span>{lesson.title}</span>
                                                                <span className="ml-auto text-xs text-slate-400">
                                                                    {lesson.duration ? Math.floor(lesson.duration/60) + "m" : "5m"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                            {(!course.modules || course.modules.length === 0) && (
                                <div className="p-8 text-center text-slate-400 italic">No modules added yet.</div>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* Instructor Bio */}
                <Reveal width="100%" delay={200}>
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-brand-dark mb-4">Instructor</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                {course.instructor?.image ? (
                                    <Image src={course.instructor.image} alt={course.instructor.name || "Instructor"} width={60} height={60} className="rounded-full border-2 border-brand-teal" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-brand-teal flex items-center justify-center text-white text-xl font-bold">
                                        {course.instructor?.name?.[0] || "T"}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-lg font-bold text-brand-dark">{course.instructor?.name || "TechStorm Mentor"}</h4>
                                    <p className="text-brand-teal text-sm">Mentor</p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {course.instructor?.bio || "Experienced mentor and systems educator at TechStorm Global."}
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
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span className="text-3xl font-bold text-brand-dark">
                                    {isPaid ? `GH₵${course.price}` : "Free"}
                                  </span>
                                  {isPaid && (
                                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                      Instructor Verified
                                    </span>
                                  )}
                                </div>
                                
                                {status === "APPROVED" || isEnrolled ? (
                                  <button 
                                      onClick={handleEnrollClick}
                                      className="block w-full text-white text-center font-bold py-3.5 rounded-lg transition-all shadow-md mb-4 bg-brand-dark hover:bg-black flex items-center justify-center gap-2"
                                  >
                                      <span>Go to Course</span>
                                      <i className="fas fa-arrow-right"></i>
                                  </button>
                                ) : status === "PENDING" ? (
                                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs">
                                      <div className="flex items-center justify-between gap-2 font-bold text-amber-900">
                                          <span className="flex items-center gap-1.5">
                                              <i className="fas fa-clock text-amber-600"></i>
                                              Approval Pending
                                          </span>
                                          {paymentRefInput && (
                                              <button
                                                type="button"
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-[11px] font-semibold text-brand-teal hover:underline"
                                              >
                                                Edit Ref
                                              </button>
                                          )}
                                      </div>
                                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                          Awaiting instructor verification{paymentRefInput ? ` (Ref: ${paymentRefInput})` : ""}.
                                      </p>
                                  </div>
                                ) : status === "REJECTED" ? (
                                  <div className="space-y-3 mb-4">
                                      <div className="w-full py-2.5 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2">
                                          <i className="fas fa-times-circle"></i>
                                          <span>Previous Request Declined</span>
                                      </div>
                                      <button 
                                          onClick={handleEnrollClick}
                                          disabled={isEnrolling}
                                          className="block w-full text-white text-center font-bold py-3.5 rounded-lg transition-all shadow-md bg-brand-teal hover:bg-[#006066] text-sm"
                                      >
                                          {isEnrolling ? "Processing..." : "Re-apply for Course"}
                                      </button>
                                  </div>
                                ) : (
                                  <button 
                                      onClick={handleEnrollClick}
                                      disabled={isEnrolling}
                                      className="block w-full text-white text-center font-bold py-3.5 rounded-lg transition-all shadow-md mb-4 disabled:opacity-50 bg-brand-teal hover:bg-[#006066]"
                                  >
                                      {isEnrolling 
                                        ? "Processing..." 
                                        : isPaid 
                                          ? `Request Access (GH₵${course.price})` 
                                          : "Enroll Now (Free)"}
                                  </button>
                                )}

                                <p className="text-center text-xs text-slate-500 mb-6">Full Lifetime Access upon approval</p>
                                
                                <div className="space-y-4">
                                    <h5 className="font-bold text-brand-dark text-sm">This course includes:</h5>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex items-center gap-3"><i className="fas fa-video w-5 text-center text-slate-400"></i> On-demand curriculum</li>
                                        <li className="flex items-center gap-3"><i className="fas fa-user-check w-5 text-center text-slate-400"></i> Direct mentor review</li>
                                        <li className="flex items-center gap-3"><i className="fas fa-mobile-alt w-5 text-center text-slate-400"></i> Mobile & desktop access</li>
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

      {/* ENROLLMENT APPLICATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-[380px] overflow-hidden border border-slate-200/80"
            >
              <div className="p-5">
                {/* Compact Header */}
                <div className="flex items-start justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0 text-sm">
                      <i className={`fas ${isPaid ? "fa-receipt" : "fa-graduation-cap"}`}></i>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-brand-dark leading-tight">
                        {isPaid ? "Request Course Access" : "Confirm Enrollment"}
                      </h3>
                      <p className="text-slate-400 text-[11px] truncate mt-0.5">
                        {course.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>

                {isPaid ? (
                  <form onSubmit={handleConfirmEnroll} className="space-y-3.5">
                    <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200/70 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-brand-dark">
                        <span className="text-slate-500 font-medium">Course Fee</span>
                        <span className="text-brand-teal text-sm">GH₵{course.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Submit your payment transaction ID below. Your instructor will verify and unlock access.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Payment / MoMo Reference <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={paymentRefInput}
                        onChange={(e) => setPaymentRefInput(e.target.value)}
                        placeholder="e.g. Trans ID: 29817294812"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-brand-dark placeholder:text-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isEnrolling}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-brand-teal hover:bg-[#006066] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isEnrolling ? "Submitting..." : "Submit Request"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enroll in this course for <strong>Free</strong> and get immediate access to all lessons and resources.
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmEnroll()}
                        disabled={isEnrolling}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-brand-teal hover:bg-[#006066] rounded-lg transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isEnrolling ? "Enrolling..." : "Enroll Free"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
