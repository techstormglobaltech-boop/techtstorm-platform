"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { markLessonComplete } from "@/app/actions/lesson";
import { useRouter, useSearchParams } from "next/navigation";
import LessonQuiz from "./LessonQuiz";
import { submitAssignment } from "@/app/actions/submissions";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface LessonPlayerProps {
  course: any;
}

export default function LessonPlayer({ course }: LessonPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCompleting, setIsCompleting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Find first uncompleted lesson or default to first lesson
  const findFirstLesson = () => {
    if (!course?.modules?.length) return null;

    // 1. Check if a specific lesson is requested via URL
    const requestedLessonId = searchParams.get('lessonId');
    if (requestedLessonId) {
        for (const mod of course.modules) {
            const found = mod.lessons?.find((l: any) => l.id === requestedLessonId);
            if (found) return found;
        }
    }

    // 2. Default logic: First uncompleted
    for (const mod of course.modules) {
        for (const lesson of (mod.lessons || [])) {
            if (!lesson.userProgress?.[0]?.isCompleted) return lesson;
        }
    }
    return course.modules[0]?.lessons?.[0] || null;
  };

  // Initialize active lesson on mount
  useEffect(() => {
    if (course && !activeLesson) {
        const lesson = findFirstLesson();
        setActiveLesson(lesson);
        // Expand the module containing the active lesson
        if (lesson) {
            const mod = course.modules.find((m: any) => m.lessons.some((l: any) => l.id === lesson.id));
            if (mod) setExpandedModules([mod.id]);
        }
    }
  }, [course]);

  const toggleModule = (modId: string) => {
      setExpandedModules(prev => 
          prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
      );
  };

  const handleAssignmentSubmit = async (assignmentId: string) => {
    if (!submissionContent) return;
    setIsSubmittingAssignment(true);
    const result = await submitAssignment(assignmentId, submissionContent);
    setIsSubmittingAssignment(false);

    if (result.success) {
        toast.success("Assignment submitted!");
        setSubmissionContent("");
        router.refresh();
    } else {
        toast.error("Failed to submit");
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    const isCurrentlyCompleted = activeLesson.userProgress?.[0]?.isCompleted;
    const newStatus = !isCurrentlyCompleted; // Toggle

    await markLessonComplete(activeLesson.id, newStatus);
    
    // Optimistic update locally
    setActiveLesson((prev: any) => ({
      ...prev,
      userProgress: [{ isCompleted: newStatus }]
    }));
    setIsCompleting(false);
    
    if (newStatus) {
        toast.success("Lesson completed!");
        // Optional: Auto-advance could go here
    }
    router.refresh(); 
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1].split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (!activeLesson) return <div className="flex items-center justify-center h-screen text-slate-500">Loading course content...</div>;

  const embedUrl = getEmbedUrl(activeLesson.videoUrl);

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
            <Link 
                href="/mentee/my-courses" 
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all group"
            >
                <i className="fas fa-arrow-left text-sm group-hover:-translate-x-0.5 transition-transform"></i>
            </Link>
            <div>
                <h1 className="font-bold text-white text-sm md:text-lg truncate max-w-[200px] md:max-w-md leading-tight">
                    {course.title}
                </h1>
                <p className="text-xs text-slate-400 hidden md:block">
                    {activeLesson.title}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
                <div className="text-xs text-slate-400 mb-1 flex justify-end items-center gap-2">
                    <span>{course.progress}% Complete</span>
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="h-full bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                    />
                </div>
            </div>
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${sidebarOpen ? 'bg-brand-teal text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
                <i className="fas fa-list-ul"></i>
            </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* CENTER CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 relative">
            
            {/* VIDEO SECTION */}
            <div className="w-full bg-black relative shadow-xl z-20">
                <div className="aspect-video w-full max-w-6xl mx-auto bg-black flex items-center justify-center relative">
                    {embedUrl ? (
                         <iframe 
                            src={embedUrl} 
                            className="w-full h-full" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={activeLesson.title}
                         ></iframe>
                    ) : (
                        <div className="text-center p-12">
                            <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                                <i className="fas fa-play text-slate-700 text-3xl ml-2"></i>
                            </div>
                            <h3 className="text-white font-medium text-lg mb-2">No Video Content</h3>
                            <p className="text-slate-500 text-sm max-w-md mx-auto">
                                This lesson focuses on reading or practical exercises. Please check the resources below.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-3 flex justify-between items-center shadow-sm">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    {['overview', 'quiz', 'assignment'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-1 text-sm font-bold capitalize transition-colors relative whitespace-nowrap ${
                                activeTab === tab 
                                ? 'text-brand-dark' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
                
                <button 
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 ${
                        activeLesson.userProgress?.[0]?.isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                        : 'bg-brand-dark text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                    }`}
                >
                        {activeLesson.userProgress?.[0]?.isCompleted ? (
                            <><i className="fas fa-check"></i> Completed</>
                        ) : (
                            <><i className="far fa-circle"></i> Mark Complete</>
                        )}
                </button>
            </div>

            {/* CONTENT BODY */}
            <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 mb-4">{activeLesson.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                        <span className="flex items-center gap-1"><i className="far fa-clock"></i> {activeLesson.duration ? Math.floor(activeLesson.duration/60) : 5} min read</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="flex items-center gap-1"><i className="far fa-calendar"></i> Updated recently</span>
                                    </div>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                        {activeLesson.description || "No description available for this lesson."}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'quiz' && (
                            <div className="max-w-3xl mx-auto">
                                {activeLesson.quizzes?.[0] ? (
                                    <LessonQuiz quiz={activeLesson.quizzes[0]} />
                                ) : (
                                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-clipboard-check text-2xl"></i>
                                        </div>
                                        <h3 className="text-slate-800 font-bold text-lg">No Quiz Available</h3>
                                        <p className="text-slate-500">This lesson doesn't have a quiz. Relax and continue learning!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'assignment' && (
                            <div className="max-w-3xl mx-auto">
                                {activeLesson.assignments?.[0] ? (
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="bg-gradient-to-r from-brand-dark to-slate-800 p-8 text-white">
                                            <div className="flex items-center gap-3 mb-2 opacity-80 text-sm font-bold uppercase tracking-wider">
                                                <i className="fas fa-code-branch"></i> Assignment
                                            </div>
                                            <h3 className="text-2xl font-bold">
                                                {activeLesson.assignments[0].title}
                                            </h3>
                                        </div>
                                        <div className="p-8">
                                            <div className="prose prose-slate max-w-none mb-10">
                                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                                    {activeLesson.assignments[0].description}
                                                </p>
                                            </div>

                                            {/* Status Check */}
                                            {activeLesson.assignments[0].submissions?.[0] ? (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className={`p-5 rounded-xl flex items-center gap-4 border ${
                                                        activeLesson.assignments[0].submissions[0].status === 'GRADED' 
                                                        ? 'bg-green-50 border-green-100 text-green-800' 
                                                        : 'bg-amber-50 border-amber-100 text-amber-800'
                                                    }`}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                            activeLesson.assignments[0].submissions[0].status === 'GRADED' ? 'bg-green-200' : 'bg-amber-200'
                                                        }`}>
                                                            <i className={`fas ${activeLesson.assignments[0].submissions[0].status === 'GRADED' ? 'fa-check' : 'fa-hourglass-half'}`}></i>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold uppercase opacity-70">Submission Status</p>
                                                            <p className="font-bold text-lg">{activeLesson.assignments[0].submissions[0].status}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {activeLesson.assignments[0].submissions[0].status === 'GRADED' && (
                                                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                                <i className="fas fa-quote-right text-6xl"></i>
                                                            </div>
                                                            <h4 className="font-bold text-brand-dark mb-2">Mentor Feedback</h4>
                                                            <p className="text-slate-600 italic mb-4 relative z-10">"{activeLesson.assignments[0].submissions[0].feedback}"</p>
                                                            <div className="inline-block bg-brand-teal text-white px-3 py-1 rounded text-sm font-bold">
                                                                Grade: {activeLesson.assignments[0].submissions[0].grade}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                        <p className="text-xs text-slate-400 uppercase font-bold mb-3">Your Work</p>
                                                        <p className="text-slate-700 text-sm whitespace-pre-line font-mono bg-white p-4 rounded border border-slate-200">
                                                            {activeLesson.assignments[0].submissions[0].content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                                        <i className="fas fa-paper-plane text-brand-teal"></i> Submit Your Work
                                                    </h4>
                                                    <p className="text-sm text-slate-500 mb-6">Paste your answer, GitHub link, or Google Doc URL below.</p>
                                                    
                                                    <textarea 
                                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none mb-4 min-h-[150px] bg-white transition-all resize-y text-slate-700"
                                                        placeholder="Type your submission here..."
                                                        value={submissionContent}
                                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                                    ></textarea>

                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={() => handleAssignmentSubmit(activeLesson.assignments[0].id)}
                                                            disabled={isSubmittingAssignment || !submissionContent}
                                                            className="bg-brand-teal text-white px-8 py-3 rounded-xl font-bold hover:bg-[#006066] transition-all shadow-md disabled:opacity-50 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                                        >
                                                            {isSubmittingAssignment ? (
                                                                <><i className="fas fa-spinner fa-spin mr-2"></i> Submitting...</>
                                                            ) : (
                                                                <>Submit Assignment <i className="fas fa-arrow-right ml-2"></i></>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-laptop-code text-2xl"></i>
                                        </div>
                                        <h3 className="text-slate-800 font-bold text-lg">No Assignment</h3>
                                        <p className="text-slate-500">No practical work required for this lesson.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>

        {/* SIDEBAR (Curriculum) */}
        <AnimatePresence mode="wait">
            {sidebarOpen && (
                <motion.aside 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 350, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-full absolute md:static right-0 z-40 shadow-2xl md:shadow-none"
                >
                    <div className="p-5 border-b border-slate-800 font-bold text-white shrink-0 flex justify-between items-center bg-slate-900">
                        <span>Course Content</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {course.modules.map((module: any, mIndex: number) => {
                            const isExpanded = expandedModules.includes(module.id);
                            return (
                                <div key={module.id} className="border-b border-slate-800">
                                    <button 
                                        onClick={() => toggleModule(module.id)}
                                        className="w-full px-5 py-4 bg-slate-900 hover:bg-slate-800/50 font-semibold text-sm text-slate-300 flex justify-between items-center transition-colors text-left"
                                    >
                                        <span className="line-clamp-1 mr-2">{module.title}</span>
                                        <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-black/20"
                                            >
                                                {module.lessons.map((lesson: any) => {
                                                    const isActive = activeLesson.id === lesson.id;
                                                    const isCompleted = lesson.userProgress?.[0]?.isCompleted;
                                                    
                                                    return (
                                                        <div 
                                                            key={lesson.id}
                                                            onClick={() => { 
                                                                setActiveLesson(lesson); 
                                                                if(window.innerWidth < 768) setSidebarOpen(false); 
                                                            }}
                                                            className={`px-5 py-3 flex gap-3 items-start cursor-pointer transition-all border-l-[3px] group ${
                                                                isActive 
                                                                ? 'bg-brand-teal/10 border-brand-teal' 
                                                                : 'hover:bg-white/5 border-transparent'
                                                            }`}
                                                        >
                                                            <div className={`mt-0.5 text-sm ${isCompleted ? 'text-brand-teal' : 'text-slate-600'}`}>
                                                                <i className={`fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm truncate ${isActive ? 'font-medium text-brand-teal' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                                                        <i className="far fa-play-circle mr-1"></i> 
                                                                        {lesson.duration ? Math.floor(lesson.duration/60) + "m" : "5m"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}