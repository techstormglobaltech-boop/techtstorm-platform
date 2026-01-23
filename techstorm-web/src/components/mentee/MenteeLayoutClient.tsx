"use client";
import { useState } from "react";
import MenteeSidebar from "@/components/mentee/MenteeSidebar";
import { User } from "next-auth";

export default function MenteeLayoutClient({
  children,
  user
}: {
  children: React.ReactNode;
  user: User | undefined;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MenteeSidebar 
        isOpen={isSidebarOpen} 
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        user={user}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-5 py-4 shadow-sm flex items-center justify-between sticky top-0 z-30">
            <div className="font-bold text-lg text-brand-dark">
                My Portal
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