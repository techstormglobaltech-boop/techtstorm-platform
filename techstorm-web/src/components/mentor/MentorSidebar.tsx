"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User } from "next-auth";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  user: User | undefined;
}

export default function MentorSidebar({ isOpen, onClose, isCollapsed, toggleCollapse, user }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white text-slate-600 flex flex-col h-screen transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Logo */}
        <div className={`h-20 flex items-center border-b border-slate-100 shrink-0 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
            <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 relative shrink-0">
                    <Image src="/Asset 3.png" alt="TS" fill className="object-contain" />
                </div>
                {!isCollapsed && <span className="font-bold text-brand-dark text-lg tracking-tight truncate">Instructor</span>}
            </Link>
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
            <nav className="space-y-1 px-3">
                {[
                    { path: "/mentor", icon: "fa-tachometer-alt", label: "Dashboard" },
                    { path: "/mentor/courses", icon: "fa-video", label: "My Courses" },
                    { path: "/mentor/students", icon: "fa-user-graduate", label: "Students" },
                    { path: "/mentor/schedule", icon: "fa-calendar-alt", label: "Schedule" },
                    { path: "/mentor/earnings", icon: "fa-wallet", label: "Earnings" },
                    { path: "/mentor/settings", icon: "fa-cog", label: "Settings" },
                ].map((item) => (
                    <Link 
                        key={item.path}
                        href={item.path} 
                        onClick={onClose}
                        title={isCollapsed ? item.label : ""}
                        className={`flex items-center py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            isCollapsed ? 'justify-center px-0' : 'px-4'
                        } ${
                            isActive(item.path) 
                            ? 'bg-brand-teal/10 text-brand-teal' 
                            : 'hover:bg-slate-50 hover:text-brand-dark'
                        }`}
                    >
                        <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
                        {!isCollapsed && <span className="ml-3 transition-opacity duration-300">{item.label}</span>}
                    </Link>
                ))}

                {/* Mobile Logout Link */}
                <button 
                    onClick={() => logout()}
                    className={`w-full flex items-center md:hidden ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-colors text-red-500 hover:bg-red-50`}
                >
                    <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
                    {!isCollapsed && <span className="ml-3 truncate">Logout</span>}
                </button>
            </nav>
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-100 shrink-0 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 overflow-hidden relative border border-slate-100 shrink-0">
                    {user?.image ? (
                        <Image src={user.image} alt="Profile" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-teal font-bold">
                            {user?.name?.[0] || "M"}
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand-dark truncate">{user?.name || "Mentor"}</p>
                            <p className="text-xs text-slate-500 truncate">Instructor</p>
                        </div>
                        <button 
                            onClick={() => logout()}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
            onClick={toggleCollapse}
            className="hidden md:flex absolute -right-3 top-24 bg-brand-teal text-white w-6 h-6 rounded-full items-center justify-center shadow-md hover:bg-[#006066] transition-colors z-50"
            title={isCollapsed ? "Expand" : "Collapse"}
        >
            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'} text-xs`}></i>
                </button>
              </div>
            </>
          );
        }
        