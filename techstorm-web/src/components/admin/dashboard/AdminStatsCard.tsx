export default function AdminStatsCard({ title, value, icon, color, trend }: any) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-brand-dark">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-xl ${color.replace('border-', 'text-')}`}>
                <i className={`fas ${icon}`}></i>
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-xs">
                <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                    <i className="fas fa-arrow-up"></i> {trend}
                </span>
                <span className="text-slate-400 ml-2">vs last week</span>
            </div>
        )}
    </div>
  );
}
