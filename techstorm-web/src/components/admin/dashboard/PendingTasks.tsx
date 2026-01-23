import Link from "next/link";

export default function PendingTasks({ stats }: any) {
  const tasks = [
    { label: "Pending Course Reviews", count: stats.reviews, link: "/admin/courses?filter=review", icon: "fa-book" },
    { label: "Assignments to Grade", count: stats.grading, link: "/admin/reports", icon: "fa-check-double" },
    { label: "New Mentor Applications", count: 0, link: "/admin/mentors", icon: "fa-user-tie" }, // Placeholder
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-brand-dark">Pending Tasks</h3>
            {stats.total > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{stats.total} New</span>
            )}
        </div>
        <div className="divide-y divide-slate-100">
            {tasks.map((task, i) => (
                <Link key={i} href={task.link} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-teal/10 group-hover:text-brand-teal transition-colors">
                            <i className={`fas ${task.icon}`}></i>
                        </div>
                        <span className="font-medium text-slate-700 group-hover:text-brand-dark">{task.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`font-bold ${task.count > 0 ? 'text-brand-amber' : 'text-slate-300'}`}>{task.count}</span>
                        <i className="fas fa-chevron-right text-xs text-slate-300"></i>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
}
