import { getMentorStats } from "@/app/actions/mentor-stats";
import Link from "next/link";
import { motion } from "framer-motion";

export default async function MentorDashboard() {
  const stats = await getMentorStats();
  if (!stats) return null;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-brand-dark">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your teaching performance.</p>
        </div>
        <Link href="/mentor/courses" className="bg-brand-teal text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#006066] transition-colors shadow-lg shadow-brand-teal/20 flex items-center gap-2">
            <i className="fas fa-plus"></i> Create New Course
        </Link>
      </div>

      {/* AI TEACHING ASSISTANT SECTION */}
      <section className="bg-brand-dark text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 bg-brand-teal/20 text-brand-teal px-4 py-1 rounded-full border border-brand-teal/30">
                    <i className="fas fa-magic text-sm"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Teaching Assistant</span>
                </div>
                <h2 className="text-2xl font-bold">
                    {stats.aiInsights.summary}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    {stats.aiInsights.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                            <i className="fas fa-chart-line text-brand-amber mt-1"></i>
                            <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-brand-teal/10 backdrop-blur-md rounded-2xl p-6 border border-brand-teal/20">
                <h4 className="font-bold text-brand-amber text-sm mb-2 flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i> Strategic Tip
                </h4>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{stats.aiInsights.recommendation}"
                </p>
            </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl"></div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: "Total Students", val: stats.studentCount, change: "Active", icon: "fa-users", color: "bg-blue-50 text-blue-600" },
            { label: "Avg. Quiz Score", val: `${stats.avgScore}%`, change: "Performance", icon: "fa-star", color: "bg-yellow-50 text-yellow-600" },
            { label: "Completion Rate", val: `${stats.completionRate}%`, change: "Progress", icon: "fa-graduation-cap", color: "bg-green-50 text-green-600" },
            { label: "Active Courses", val: stats.coursesCount, change: "Published", icon: "fa-video", color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
                        <i className={`fas ${stat.icon}`}></i>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-slate-50 text-slate-500">
                        {stat.change}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-brand-dark mb-1">{stat.val}</h3>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-brand-dark">Recent Enrollments</h3>
                <Link href="/mentor/courses" className="text-sm text-brand-teal hover:underline">View All</Link>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                    <tr>
                        <th className="p-4 pl-6">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {stats?.recentEnrollments.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6 font-medium text-brand-dark">
                                <div>{row.user.name || "Student"}</div>
                                <div className="text-xs text-slate-500 font-normal">{row.user.email}</div>
                            </td>
                            <td className="p-4 text-slate-600">{row.course.title}</td>
                            <td className="p-4 text-slate-500">{new Date(row.enrolledAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {(!stats?.recentEnrollments || stats.recentEnrollments.length === 0) && (
                        <tr>
                            <td colSpan={3} className="p-10 text-center text-slate-500">No enrollments yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-brand-dark mb-6">Course Performance</h3>
            <div className="space-y-6">
                <div className="text-center py-10 text-slate-400">
                    <i className="fas fa-chart-line text-4xl mb-3 opacity-20"></i>
                    <p>Detailed analytics will appear here as your courses grow.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
