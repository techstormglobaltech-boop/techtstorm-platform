"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { markLessonComplete } from "@/app/actions/lesson";
import { useRouter, useSearchParams } from "next/navigation";
import LessonQuiz from "./LessonQuiz";
import { submitAssignment } from "@/app/actions/submissions";
import toast from "react-hot-toast";

interface LessonPlayerProps {
  course: any;
}

export default function LessonPlayer({ course }: LessonPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... rest of component
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

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
  // Find first uncompleted lesson or default to first lesson
  const findFirstLesson = () => {
    // 1. Check if a specific lesson is requested via URL
    const requestedLessonId = searchParams.get('lessonId');
    if (requestedLessonId) {
        for (const mod of course.modules) {
            const found = mod.lessons.find((l: any) => l.id === requestedLessonId);
            if (found) return found;
        }
    }

    // 2. Default logic: First uncompleted
    for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
            if (!lesson.userProgress?.[0]?.isCompleted) return lesson;
        }
    }
    return course.modules[0]?.lessons[0] || null;
  };

  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isCompleting, setIsCompleting] = useState(false);

  // Initialize active lesson on mount
  useEffect(() => {
    if (course && !activeLesson) {
        setActiveLesson(findFirstLesson());
    }
  }, [course]);

  if (!activeLesson) return <div className="p-10 text-center">No lessons found for this course.</div>;

  const handleComplete = async () => {
    setIsCompleting(true);
    const isCurrentlyCompleted = activeLesson.userProgress?.[0]?.isCompleted;
    const newStatus = !isCurrentlyCompleted; // Toggle

    await markLessonComplete(activeLesson.id, newStatus);
    
    // Optimistic update locally
    activeLesson.userProgress = [{ isCompleted: newStatus }];
    setIsCompleting(false);
    router.refresh(); // Refresh to update server data (progress bar etc)
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

  const embedUrl = getEmbedUrl(activeLesson.videoUrl);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <Link href="/mentee/my-courses" className="text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-chevron-left mr-1"></i> Back
            </Link>
            <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>
            <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{course.title}</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-slate-400 mb-1">Your Progress: {course.progress}%</span>
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
            </div>
            {/* <button className="w-8 h-8 rounded-full bg-brand-amber text-brand-dark font-bold flex items-center justify-center text-xs">
                User
            </button> */}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* VIDEO AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-black">
            <div className="aspect-video bg-black flex items-center justify-center relative group w-full">
                {/* Video Player */}
                {embedUrl ? (
                     <iframe 
                        src={embedUrl} 
                        className="w-full h-full" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeLesson.title}
                     ></iframe>
                ) : (
                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-brand-teal/20 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <i className="fas fa-video-slash text-3xl"></i>
                        </div>
                        <p className="text-slate-300 font-medium mb-4">No video available or invalid link.</p>
                        <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeLesson.title + " " + course.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                            <i className="fab fa-youtube"></i> Search on YouTube
                        </a>
                    </div>
                )}
                
                {/* Sidebar Toggle (Mobile/Desktop) */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-4 right-4 bg-slate-800/80 text-white p-2 rounded hover:bg-brand-teal transition-colors z-10"
                    title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                >
                    <i className={`fas fa-columns`}></i>
                </button>
            </div>

            {/* TABS & CONTENT */}
            <div className="flex-1 bg-white">
                <div className="border-b border-slate-200 px-6 flex justify-between items-center">
                    <div className="flex gap-8">
                        {['overview', 'quiz', 'assignment', 'discussion'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                                    activeTab === tab 
                                    ? 'border-brand-teal text-brand-teal' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            activeLesson.userProgress?.[0]?.isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-brand-teal text-white hover:bg-[#006066]'
                        }`}
                    >
                         {activeLesson.userProgress?.[0]?.isCompleted ? (
                             <><i className="fas fa-check"></i> Completed</>
                         ) : (
                             <><i className="far fa-circle"></i> Mark Complete</>
                         )}
                    </button>
                </div>
                
                <div className="p-6 md:p-8 max-w-4xl">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-brand-dark">{activeLesson.title}</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {activeLesson.description || "No description available for this lesson."}
                            </p>
                        </div>
                    )}
                    {activeTab === 'quiz' && (
                        <div className="space-y-6">
                            {activeLesson.quizzes?.[0] ? (
                                <LessonQuiz quiz={activeLesson.quizzes[0]} />
                            ) : (
                                <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <i className="fas fa-tasks text-4xl mb-4 opacity-20"></i>
                                    <p>No quiz available for this lesson.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'assignment' && (
                        <div className="space-y-6">
                            {activeLesson.assignments?.[0] ? (
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 p-6 border-b border-slate-200">
                                        <h3 className="text-xl font-bold text-brand-dark flex items-center gap-3">
                                            <i className="fas fa-pencil-alt text-brand-teal"></i>
                                            {activeLesson.assignments[0].title}
                                        </h3>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <div className="prose prose-slate max-w-none">
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-8">
                                                {activeLesson.assignments[0].description}
                                            </p>
                                        </div>

                                        {/* Status Check */}
                                        {activeLesson.assignments[0].submissions?.[0] ? (
                                            <div className="space-y-6">
                                                <div className={`p-4 rounded-lg flex items-center gap-3 ${activeLesson.assignments[0].submissions[0].status === 'GRADED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    <i className={`fas ${activeLesson.assignments[0].submissions[0].status === 'GRADED' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                                                    <span className="font-bold">Status: {activeLesson.assignments[0].submissions[0].status}</span>
                                                </div>
                                                
                                                {activeLesson.assignments[0].submissions[0].status === 'GRADED' && (
                                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="font-bold text-brand-dark">Mentor Feedback</h4>
                                                            <span className="text-2xl font-black text-brand-teal">{activeLesson.assignments[0].submissions[0].grade}</span>
                                                        </div>
                                                        <p className="text-slate-600 italic">"{activeLesson.assignments[0].submissions[0].feedback}"</p>
                                                    </div>
                                                )}

                                                <div className="p-4 border border-slate-100 rounded-lg">
                                                    <p className="text-xs text-slate-400 uppercase font-bold mb-2">Your Submission</p>
                                                    <p className="text-slate-600 text-sm whitespace-pre-line">{activeLesson.assignments[0].submissions[0].content}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-10 p-6 bg-brand-teal/5 rounded-xl border border-brand-teal/10">
                                                <h4 className="font-bold text-brand-dark mb-2">Submit Your Work</h4>
                                                <p className="text-sm text-slate-500 mb-6">Write your answer or provide a link to your work below.</p>
                                                
                                                <textarea 
                                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none mb-4 min-h-[150px]"
                                                    placeholder="Type your submission here..."
                                                    value={submissionContent}
                                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                                ></textarea>

                                                <button 
                                                    onClick={() => handleAssignmentSubmit(activeLesson.assignments[0].id)}
                                                    disabled={isSubmittingAssignment || !submissionContent}
                                                    className="bg-brand-teal text-white px-8 py-3 rounded-lg font-bold hover:bg-[#006066] transition-colors shadow-md disabled:opacity-50"
                                                >
                                                    {isSubmittingAssignment ? "Submitting..." : "Submit Assignment"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <i className="fas fa-file-signature text-4xl mb-4 opacity-20"></i>
                                    <p>No practical assignment for this lesson.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'discussion' && (
                        <div className="text-center py-10 text-slate-500">
                            <i className="fas fa-comments text-4xl mb-3 opacity-20"></i>
                            <p>Discussion forum coming soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>

        {/* SIDEBAR (Curriculum) */}
        <aside 
            className={`w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300 absolute md:static h-full right-0 z-10 ${
                sidebarOpen ? 'translate-x-0' : 'translate-x-full md:w-0 md:border-l-0 overflow-hidden'
            }`}
        >
            <div className="p-4 bg-white border-b border-slate-200 font-bold text-brand-dark shrink-0 flex justify-between items-center">
                <span>Course Content</span>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {course.modules.map((module: any, mIndex: number) => (
                    <div key={module.id} className="border-b border-slate-200">
                        <div className="px-4 py-3 bg-slate-100 font-semibold text-sm text-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-200 transition-colors">
                            {module.title}
                            {/* <i className="fas fa-chevron-down text-xs text-slate-400"></i> */}
                        </div>
                        <div>
                            {module.lessons.map((lesson: any) => (
                                <div 
                                    key={lesson.id}
                                    onClick={() => { setActiveLesson(lesson); if(window.innerWidth < 768) setSidebarOpen(false); }}
                                    className={`px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors border-l-4 ${
                                        activeLesson.id === lesson.id 
                                        ? 'bg-white border-brand-teal' 
                                        : 'hover:bg-white border-transparent'
                                    }`}
                                >
                                    <div className="mt-0.5">
                                        {lesson.userProgress?.[0]?.isCompleted ? (
                                            <i className="fas fa-check-circle text-brand-teal"></i>
                                        ) : (
                                            <i className="far fa-circle text-slate-300"></i>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`text-sm ${activeLesson.id === lesson.id ? 'font-semibold text-brand-dark' : 'text-slate-600'}`}>
                                            {lesson.title}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                            <i className="far fa-play-circle"></i> {lesson.duration ? Math.floor(lesson.duration/60) + "m" : "5m"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>

      </div>
    </div>
  );
}
