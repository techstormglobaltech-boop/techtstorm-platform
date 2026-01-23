"use client";
import { useState } from "react";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { User } from "next-auth";

export default function MentorLayoutClient({
  children,
  user
}: {
  children: React.ReactNode;
  user: User | undefined;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-brand-dark">
      <MentorSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-5 py-4 shadow-sm flex items-center justify-between sticky top-0 z-30 border-b border-slate-100">
            <div className="font-bold text-lg text-brand-dark">
                Instructor Portal
            </div>
            <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-brand-teal focus:outline-none p-2 rounded-md hover:bg-slate-100 transition-colors"
            >
                <i className="fas fa-bars text-xl"></i>
            </button>
        </div>

        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden p-6 md:p-10">
            {children}
        </main>
      </div>
    </div>
  );
}