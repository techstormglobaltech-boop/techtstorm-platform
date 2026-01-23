"use client";
import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { User } from "next-auth";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: User | undefined;
}

export default function AdminLayoutClient({
  children,
  user
}: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-5 py-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
            <div className="font-bold text-lg">
                <span className="text-brand-teal">Tech</span><span className="text-brand-amber">Storm</span> <span className="text-slate-400 font-normal">| Admin</span>
            </div>
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-brand-teal focus:outline-none p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Toggle Menu"
            >
                <i className="fas fa-bars text-xl"></i>
            </button>
        </div>

        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
            {children}
        </main>
      </div>
    </div>
  );
}