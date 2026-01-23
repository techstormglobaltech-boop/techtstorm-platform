import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ feed }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-brand-dark">Recent Activity</h3>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
            {feed.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No recent activity.</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {feed.map((item: any, i: number) => (
                        <div key={i} className="p-4 flex gap-4 items-start hover:bg-slate-50/50 transition-colors">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 relative">
                                {item.user?.image ? (
                                    <Image src={item.user.image} alt="User" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                        {item.user?.name?.[0] || "?"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">
                                    <span className="font-bold">{item.user?.name || "User"}</span> {item.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                                item.type === 'registration' ? 'bg-green-400' :
                                item.type === 'enrollment' ? 'bg-blue-400' :
                                'bg-amber-400'
                            }`}></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
