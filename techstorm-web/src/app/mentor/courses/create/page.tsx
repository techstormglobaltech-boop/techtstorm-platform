"use client";
import { useState } from "react";
import Link from "next/link";

export default function CreateCourse() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/mentor/courses" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-white">Create New Course</h1>
            <p className="text-slate-400 mt-1">Step {activeStep} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-brand-teal transition-all duration-500" style={{ width: `${(activeStep / 3) * 100}%` }}></div>
      </div>

      {/* Form Content */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
        
        {/* Step 1: Basic Info */}
        {activeStep === 1 && (
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">Course Information</h2>
                
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Course Title</label>
                    <input type="text" placeholder="e.g., Advanced React Patterns" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Category</label>
                        <select className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors">
                            <option>Select Category...</option>
                            <option>Web Development</option>
                            <option>Data Science</option>
                            <option>AI & Machine Learning</option>
                            <option>Design</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Price (GH₵)</label>
                        <input type="number" placeholder="49.99" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Description</label>
                    <textarea rows={5} placeholder="What will students learn in this course?" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-brand-teal focus:outline-none transition-colors resize-none"></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Thumbnail</label>
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <i className="fas fa-cloud-upload-alt text-3xl text-slate-500 mb-3"></i>
                        <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-600 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                    </div>
                </div>
            </div>
        )}

        {/* Step 2: Curriculum */}
        {activeStep === 2 && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Curriculum Builder</h2>
                    <button className="text-sm text-brand-teal hover:underline font-medium">+ Add Module</button>
                </div>

                {/* Module 1 */}
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-800 p-4 flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-grip-lines text-slate-500"></i>
                            <span className="font-bold text-white">Module 1: Introduction</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="text-slate-400 hover:text-white"><i className="fas fa-edit"></i></button>
                            <button className="text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div className="p-4 space-y-3 bg-slate-900/50">
                        <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded">
                            <i className="fas fa-play-circle text-slate-500"></i>
                            <span className="text-sm text-slate-300">Welcome to the course</span>
                            <span className="ml-auto text-xs text-slate-500">Video • 5:00</span>
                        </div>
                        <button className="w-full py-2 border border-dashed border-slate-700 text-slate-500 text-sm rounded hover:bg-slate-800 hover:text-white transition-colors">
                            + Add Lesson
                        </button>
                    </div>
                </div>

                {/* Module 2 Placeholder */}
                <div className="border border-slate-700 rounded-lg overflow-hidden opacity-60">
                    <div className="bg-slate-800 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-grip-lines text-slate-500"></i>
                            <span className="font-bold text-white">Module 2: Advanced Concepts</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Review */}
        {activeStep === 3 && (
            <div className="space-y-6 text-center py-10">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-4xl">
                    <i className="fas fa-check"></i>
                </div>
                <h2 className="text-2xl font-bold text-white">Ready to Publish!</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Your course "Advanced React Patterns" is ready to be submitted for review. Once approved by an admin, it will be visible to all students.
                </p>
                
                <div className="bg-slate-950 p-6 rounded-lg text-left max-w-lg mx-auto mt-8 border border-slate-800">
                    <h4 className="font-bold text-white mb-4 border-b border-slate-800 pb-2">Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Modules:</span> <span className="text-slate-300">2</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Lessons:</span> <span className="text-slate-300">1</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Price:</span> <span className="text-slate-300">GH₵49.99</span></div>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="flex justify-between">
        {activeStep > 1 ? (
            <button 
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
                Back
            </button>
        ) : <div></div>}
        
        <button 
            onClick={() => {
                if (activeStep < 3) setActiveStep(activeStep + 1);
                else alert("Course Submitted!");
            }}
            className="px-8 py-3 bg-brand-teal text-white font-bold rounded-lg hover:bg-[#006066] transition-colors shadow-lg shadow-brand-teal/20"
        >
            {activeStep === 3 ? "Submit for Review" : "Next Step"}
        </button>
      </div>

    </div>
  );
}
