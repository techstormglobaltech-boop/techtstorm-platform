"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { User } from "next-auth";
import { logout } from "@/app/actions/auth";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  user: User | undefined;
}

export default function MenteeSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse, user }: SidebarProps) {
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        
        {/* Logo & Toggle */}
        <div className={`h-20 flex items-center border-b border-slate-100 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
            {!isCollapsed && (
                <Link href="/" className="block relative w-32 h-10">
                    <Image src="/logo.png" alt="TechStorm" fill className="object-contain" />
                </Link>
            )}
            {isCollapsed && (
                <Link href="/" className="block relative w-8 h-8">
                     <Image src="/Asset 3.png" alt="TechStorm" fill className="object-contain" />
                </Link>
            )}
            
            <button 
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-brand-teal transition-colors"
            >
                <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
            <nav className="space-y-1 px-3">
                {[
                    { path: "/mentee", icon: "fa-columns", label: "Dashboard" },
                    { path: "/mentee/my-courses", icon: "fa-book-reader", label: "My Learning" },
                    { path: "/mentee/grades", icon: "fa-chart-line", label: "My Grades" },
                    { path: "/mentee/schedule", icon: "fa-calendar-check", label: "Schedule" },
                    { path: "/mentee/achievements", icon: "fa-medal", label: "Achievements" },
                    { path: "/mentee/settings", icon: "fa-cog", label: "Settings" },
                ].map((item) => (
                    <Link 
                        key={item.path}
                        href={item.path} 
                        onClick={onClose}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.path) 
                            ? 'bg-brand-teal/10 text-brand-teal' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-dark'
                        }`}
                        title={isCollapsed ? item.label : ""}
                    >
                        <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
                        {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
                    </Link>
                ))}
                
                {/* Mobile Logout Link */}
                <button 
                    onClick={handleLogout}
                    disabled={isPending}
                    className={`w-full flex items-center md:hidden ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-colors text-red-500 hover:bg-red-50 disabled:opacity-50`}
                >
                    <i className={`fas ${isPending ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'} w-6 text-center text-lg`}></i>
                    {!isCollapsed && <span className="ml-3 truncate">{isPending ? 'Logging out...' : 'Logout'}</span>}
                </button>
            </nav>

            {/* Mentor Promo (Hide when collapsed) */}
            {!isCollapsed && (
                <div className="mt-8 px-4">
                    <div className="bg-gradient-to-br from-brand-dark to-slate-800 rounded-xl p-4 text-white text-center">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="fas fa-lightbulb text-brand-amber"></i>
                        </div>
                        <h4 className="font-bold text-sm mb-1">Need Help?</h4>
                        <p className="text-xs text-slate-300 mb-3">Book a 1:1 session with your mentor.</p>
                        <Link 
                            href="/mentee/schedule"
                            onClick={onClose}
                            className="block w-full py-2 bg-brand-amber text-brand-dark text-xs font-bold rounded shadow hover:bg-[#e6a200] transition-colors text-center"
                        >
                            Book Session
                        </Link>
                    </div>
                </div>
            )}
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t border-slate-100 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 overflow-hidden relative shrink-0">
                {user?.image ? (
                    <Image src={user.image} alt="Profile" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-teal font-bold">
                        {user?.name?.[0] || "M"}
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-dark truncate">{user?.name || "Mentee"}</p>
                    <p className="text-xs text-slate-500 truncate">Mentee</p>
                </div>
            )}
            <button 
                onClick={handleLogout}
                disabled={isPending}
                className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Logout"
            >
                <i className={`fas ${isPending ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'}`}></i>
            </button>
        </div>
      </div>
    </>
  );
}