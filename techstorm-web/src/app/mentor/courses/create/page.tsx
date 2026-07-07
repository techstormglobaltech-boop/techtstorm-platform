"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCourse, generateAICourse } from "@/app/actions/course";
import toast from "react-hot-toast";

export default function CreateCourse() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // States
  const [creationMethod, setCreationMethod] = useState<'MANUAL' | 'AI'>('MANUAL');
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) {
          toast.error("Course title/topic is required");
          return;
      }

      startTransition(async () => {
          let result;
          if (creationMethod === 'AI') {
              const loadingToast = toast.loading("Generating course curriculum with AI (this may take a minute)...");
              result = await generateAICourse(title, level);
              toast.dismiss(loadingToast);
          } else {
              result = await createCourse(title);
          }

          if (result.success && result.courseId) {
              toast.success("Course created successfully!");
              router.push(`/mentor/courses/${result.courseId}`);
          } else {
              toast.error(result.error || "Failed to create course");
          }
      });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mentor/courses" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-white">Create New Course</h1>
            <p className="text-slate-400 mt-1">Start building your next masterpiece</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        
        <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
            <button 
                onClick={() => setCreationMethod('MANUAL')}
                className={`px-4 py-2 font-bold rounded-lg transition-colors ${creationMethod === 'MANUAL' ? 'bg-brand-teal text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <i className="fas fa-edit mr-2"></i> Manual Creation
            </button>
            <button 
                onClick={() => setCreationMethod('AI')}
                className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${creationMethod === 'AI' ? 'bg-brand-dark text-white border border-brand-teal/30' : 'text-slate-400 hover:text-white'}`}
            >
                <i className="fas fa-magic text-brand-amber"></i> Generate with AI
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {creationMethod === 'MANUAL' ? (
                <>
                    <h2 className="text-xl font-bold text-white mb-6">Manual Course Setup</h2>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Course Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Advanced React Patterns" 
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-brand-dark/50 p-6 rounded-lg border border-brand-teal/20 mb-6 flex gap-4">
                        <div className="text-brand-amber text-3xl">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">AI Course Assistant</h3>
                            <p className="text-slate-400 text-sm">Tell us what you want to teach, and our AI will instantly generate a comprehensive curriculum structure with modules, lessons, and reading materials.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">What is the topic of the course?</label>
                        <textarea 
                            placeholder="e.g. A complete course on Python for Data Science for beginners, with 5 modules and 4 lessons each." 
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors resize-none h-32" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isPending}
                        />
                        <p className="text-xs text-slate-500">Be as specific as you want! You can specify the number of modules, lessons, and content types (Video, Reading, Quiz, Assignment).</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Target Audience Level</label>
                        <select 
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            disabled={isPending}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="All Levels">All Levels</option>
                        </select>
                    </div>
                </>
            )}

            <div className="pt-6 border-t border-slate-800 flex justify-end">
                <button 
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] transition-colors shadow-lg shadow-brand-teal/20 disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending ? (
                        <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                    ) : creationMethod === 'AI' ? (
                        <><i className="fas fa-magic"></i> Generate Course</>
                    ) : (
                        <>Create Course <i className="fas fa-arrow-right"></i></>
                    )}
                </button>
            </div>
        </form>

      </div>
    </div>
  );
}
