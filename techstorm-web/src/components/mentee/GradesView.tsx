"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GradesViewProps {
  gradebook: any[];
}

export default function GradesView({ gradebook }: GradesViewProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(gradebook[0]?.courseId || "");
  
  const currentCourse = gradebook.find(c => c.courseId === selectedCourseId);

  if (!currentCourse) {
    return (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-graduation-cap text-slate-300 text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-brand-dark">No Grades Found</h3>
            <p className="text-slate-500">You haven't enrolled in any courses or completed any assessments yet.</p>
        </div>
    );
  }

  // Prepare Chart Data
  const chartData = [
    { name: 'Avg Quiz Score', value: currentCourse.stats.avgQuizScore, fill: '#007C85' },
    { name: 'Quizzes Done', value: (currentCourse.stats.quizzesCompleted / (currentCourse.stats.totalQuizzes || 1)) * 100, fill: '#FFB000' },
    { name: 'Assign. Done', value: (currentCourse.stats.assignmentsSubmitted / (currentCourse.stats.totalAssignments || 1)) * 100, fill: '#1E293B' },
  ];

  return (
    <div className="space-y-8">
      {/* Course Selector */}
      <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
        {gradebook.map((course) => (
            <button
                key={course.courseId}
                onClick={() => setSelectedCourseId(course.courseId)}
                className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-xl border transition-all min-w-[200px] ${
                    selectedCourseId === course.courseId 
                    ? "bg-brand-dark text-white border-brand-dark shadow-lg ring-2 ring-brand-teal/20" 
                    : "bg-white text-brand-dark border-slate-200 hover:border-brand-teal hover:shadow-md"
                }`}
            >
                <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-slate-800 flex-shrink-0">
                    {course.courseImage ? (
                        <Image src={course.courseImage} alt={course.courseTitle} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <i className="fas fa-image"></i>
                        </div>
                    )}
                </div>
                <div className="text-left overflow-hidden">
                    <p className={`text-sm font-bold truncate ${selectedCourseId === course.courseId ? "text-white" : "text-brand-dark"}`}>
                        {course.courseTitle}
                    </p>
                    <p className={`text-xs truncate ${selectedCourseId === course.courseId ? "text-slate-300" : "text-slate-500"}`}>
                        {course.stats.avgQuizScore}% Avg Score
                    </p>
                </div>
            </button>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Stats & Chart */}
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Quiz Average</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-brand-teal">{currentCourse.stats.avgQuizScore}%</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Completion</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-brand-amber">
                            {Math.round(((currentCourse.stats.quizzesCompleted + currentCourse.stats.assignmentsSubmitted) / (currentCourse.stats.totalQuizzes + currentCourse.stats.totalAssignments || 1)) * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-80">
                <h4 className="font-bold text-brand-dark mb-6">Performance Overview</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#f1f5f9'}}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right Col: Detailed Lists */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Assignments Section */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-brand-dark">Assignments</h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {currentCourse.assignments.length} Total
                    </span>
                </div>
                <div className="divide-y divide-slate-100">
                    {currentCourse.assignments.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No assignments in this course yet.</div>
                    ) : (
                        currentCourse.assignments.map((assign: any) => (
                            <Link 
                                href={`/learn/${selectedCourseId}?lessonId=${assign.lessonId}`}
                                key={assign.id} 
                                className="block p-6 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-brand-dark text-sm">{assign.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">Lesson: {assign.lessonTitle}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                        assign.status === 'GRADED' ? 'bg-green-100 text-green-700' :
                                        assign.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {assign.status === 'PENDING' ? 'Submitted' : assign.status}
                                    </span>
                                </div>
                                
                                {assign.status === 'GRADED' && (
                                    <div className="mt-3 bg-green-50/50 border border-green-100 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-green-800">Grade: {assign.grade}</span>
                                            {assign.submittedAt && <span className="text-[10px] text-slate-400">Graded on {format(new Date(assign.submittedAt), 'MMM d, yyyy')}</span>}
                                        </div>
                                        {assign.feedback && (
                                            <p className="text-xs text-green-700 italic">"{assign.feedback}"</p>
                                        )}
                                    </div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Quizzes Section */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-brand-dark">Quizzes</h3>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {currentCourse.quizzes.length} Total
                    </span>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Quiz Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentCourse.quizzes.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-400">No quizzes available yet.</td></tr>
                        ) : (
                            currentCourse.quizzes.map((quiz: any) => (
                                <tr key={quiz.id} className="hover:bg-slate-50 relative group">
                                    <td className="px-6 py-4 font-medium text-brand-dark">
                                        <Link href={`/learn/${selectedCourseId}?lessonId=${quiz.lessonId}`} className="absolute inset-0 z-10"></Link>
                                        <span className="relative z-0 group-hover:text-brand-teal transition-colors">{quiz.title}</span>
                                        <div className="text-xs text-slate-400 font-normal mt-0.5">{quiz.lessonTitle}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {quiz.status === "Completed" ? (
                                            <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                                <i className="fas fa-check-circle"></i> Completed
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Not Started</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {quiz.status === "Completed" ? (
                                            <div className="inline-flex flex-col items-end">
                                                <span className={`font-bold ${quiz.percentage >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {quiz.percentage}%
                                                </span>
                                                <span className="text-[10px] text-slate-400">{quiz.score}/{quiz.totalQuestions} pts</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
      </div>
    </div>
  );
}
