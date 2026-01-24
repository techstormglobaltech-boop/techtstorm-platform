"use client";
import { useState, useTransition } from "react";
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

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse, user }: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <>
        {/* Mobile Overlay */}
        <div 
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={onClose}
        ></div>

        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col h-screen transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
          
          {/* Header / Logo */}
          <div className={`h-20 flex items-center border-b border-white/10 shrink-0 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
            <Link href="/admin" className="block relative">
                {isCollapsed ? (
                     <div className="w-10 h-10 relative">
                        <Image 
                            src="/Asset 3.png" 
                            alt="TS" 
                            fill
                            className="object-contain"
                        />
                     </div>
                ) : (
                    <div className="w-32 h-10 relative">
                        <Image 
                            src="/logo.png" 
                            alt="TechStorm Global" 
                            fill 
                            className="object-contain"
                        />
                    </div>
                )}
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 py-5 overflow-y-auto overflow-x-hidden">
            <nav className="flex flex-col gap-1">
                {[
                    { path: "/admin", icon: "fa-home", label: "Dashboard" },
                    { path: "/admin/courses", icon: "fa-book-open", label: "Courses" },
                    { path: "/admin/events", icon: "fa-calendar-alt", label: "Events" },
                    { path: "/admin/gallery", icon: "fa-images", label: "Gallery" },
                    { path: "/admin/mentors", icon: "fa-users", label: "Mentors" },
                    { path: "/admin/mentees", icon: "fa-user-graduate", label: "Mentees" },
                    { path: "/admin/reports", icon: "fa-chart-bar", label: "Reports" },
                    { path: "/admin/settings", icon: "fa-cog", label: "Settings" }
                ].map((item) => (
                    <Link 
                        key={item.path}
                        href={item.path} 
                        onClick={onClose}
                        title={isCollapsed ? item.label : ""}
                        className={`flex items-center py-4 text-slate-400 hover:bg-white/5 hover:text-brand-amber border-r-4 transition-all whitespace-nowrap
                            ${isCollapsed ? 'justify-center px-0' : 'px-6'}
                            ${isActive(item.path) ? 'bg-white/5 text-brand-amber border-brand-teal' : 'border-transparent'}
                        `}
                    >
                        <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
                        <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            {item.label}
                        </span>
                    </Link>
                ))}

                {/* Mobile Logout Link */}
                <button 
                    onClick={handleLogout}
                    disabled={isPending}
                    className={`w-full flex items-center md:hidden py-4 text-slate-400 hover:bg-white/5 hover:text-red-400 border-r-4 border-transparent transition-all whitespace-nowrap disabled:opacity-50 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}
                >
                    <i className={`fas ${isPending ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'} w-6 text-center text-lg`}></i>
                    <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        {isPending ? 'Logging out...' : 'Logout'}
                    </span>
                </button>
            </nav>
          </div>

          {/* User Profile */}
          <div className={`p-4 border-t border-white/10 flex items-center gap-3 shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center font-bold text-white shrink-0">
                {user?.name?.[0] || "A"}
            </div>
            {!isCollapsed && (
                <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user?.name || "Admin User"}</p>
                    <button 
                        onClick={handleLogout}
                        disabled={isPending}
                        className="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            )}
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