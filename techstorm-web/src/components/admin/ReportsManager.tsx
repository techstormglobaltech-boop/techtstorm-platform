"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ReportsManagerProps {
  initialData: any;
}

export default function ReportsManager({ initialData }: ReportsManagerProps) {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const { stats, topCategories, aiInsights, recentCompletions } = initialData;

  const COLORS = ['bg-brand-teal', 'bg-brand-amber', 'bg-slate-800', 'bg-slate-400'];

  return (
    <div className="p-6 md:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">AI-powered platform performance and student insights.</p>
        </div>
        <div className="flex gap-3">
            <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand-teal shadow-sm cursor-pointer text-sm font-medium"
            >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
            </select>
            <button className="bg-brand-dark text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm">
                <i className="fas fa-download"></i> Export PDF
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Total Students", val: stats.totalUsers, change: "Live", isPos: true, icon: "fa-user-graduate", color: "bg-blue-100 text-blue-600" },
            { label: "Total Enrollments", val: stats.totalEnrollments, change: "Active", isPos: true, icon: "fa-book-reader", color: "bg-green-100 text-green-600" },
            { label: "Avg. Completion", val: `${stats.completionRate}%`, change: "Progress", isPos: true, icon: "fa-graduation-cap", color: "bg-brand-amber/20 text-brand-amber" },
            { label: "Live Courses", val: stats.totalCourses, change: "Public", isPos: true, icon: "fa-video", color: "bg-purple-100 text-purple-600" },
        ].map((stat, i) => (
            <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${stat.color}`}>
                        <i className={`fas ${stat.icon}`}></i>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${stat.isPos ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-brand-dark mb-1">{stat.val}</h3>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </motion.div>
        ))}
      </div>

      {/* AI ANALYST SECTION */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-dark text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 grid md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-2 space-y-6">
                <div className="inline-flex items-center gap-2 bg-brand-teal/20 text-brand-teal px-4 py-1.5 rounded-full border border-brand-teal/30">
                    <i className="fas fa-robot text-sm"></i>
                    <span className="text-xs font-black uppercase tracking-widest">AI Platform Analyst</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight">
                    {aiInsights.summary}
                </h2>
                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                    {aiInsights.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <i className="fas fa-chart-line text-brand-amber text-sm"></i>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="font-bold text-brand-amber mb-3 flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i> Actionable Rec
                </h4>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                    "{aiInsights.recommendation}"
                </p>
            </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      </motion.section>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Course Popularity Breakdown */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-brand-dark mb-6">Course Categories</h3>
            <div className="space-y-6">
                {topCategories.map((cat: any, i: number) => {
                    const percentage = Math.round((cat.count / stats.totalCourses) * 100);
                    return (
                        <div key={i}>
                            <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                <span>{cat.name}</span>
                                <span>{cat.count} Courses</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className={`h-full ${COLORS[i % COLORS.length]} rounded-full`}
                                />
                            </div>
                        </div>
                    );
                })}
                {topCategories.length === 0 && <p className="text-slate-400 text-sm italic">No category data yet.</p>}
            </div>
        </div>

        {/* Recent Enrollments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-brand-dark">Recent Platform Activity</h3>
                <button className="text-brand-teal text-xs font-black uppercase tracking-widest hover:underline">Full Log</button>
            </div>
            <table className="w-full text-left text-sm">
                <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <tr>
                        <th className="p-5">Student</th>
                        <th className="p-5">Course Joined</th>
                        <th className="p-5">Date</th>
                        <th className="p-5 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {recentCompletions.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 font-bold text-brand-dark">{row.user.name || "Student"}</td>
                            <td className="p-5 text-slate-600 font-medium">{row.course.title}</td>
                            <td className="p-5 text-slate-400">{new Date(row.enrolledAt).toLocaleDateString()}</td>
                            <td className="p-5 text-right">
                                <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Enrolled</span>
                            </td>
                        </tr>
                    ))}
                    {recentCompletions.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-10 text-center text-slate-400">No recent activity.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}