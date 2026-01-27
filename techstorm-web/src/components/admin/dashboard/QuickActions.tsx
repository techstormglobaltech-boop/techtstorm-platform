import Link from "next/link";

export default function QuickActions() {
  const actions = [
    { label: "New Event", icon: "fa-calendar-plus", href: "/admin/events", color: "bg-brand-teal text-white hover:bg-[#006066]" },
    { label: "Invite User", icon: "fa-user-plus", href: "/admin/invite", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "System Settings", icon: "fa-cog", href: "/admin/settings", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
  ];

  return (
    <div className="flex gap-3">
        {actions.map((action, i) => (
            <Link 
                key={i} 
                href={action.href}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${action.color}`}
            >
                <i className={`fas ${action.icon}`}></i> {action.label}
            </Link>
        ))}
    </div>
  );
}
