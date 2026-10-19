"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface SessionWatcherProps {
  expiresAt?: number;
  isAuthenticated: boolean;
}

export default function SessionWatcher({ expiresAt, isAuthenticated }: SessionWatcherProps) {
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);
  const pathname = usePathname();

  const handleSessionExpired = useCallback(() => {
    // Only prompt if on a dashboard/protected route
    const isDashboard =
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/mentor") ||
      pathname?.startsWith("/mentee") ||
      pathname?.startsWith("/learn");

    if (isDashboard) {
      setIsExpiredModalOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check on mount
    if (expiresAt && Date.now() >= expiresAt) {
      handleSessionExpired();
      return;
    }

    // Check periodically every minute
    const interval = setInterval(() => {
      if (expiresAt && Date.now() >= expiresAt) {
        handleSessionExpired();
      }
    }, 60000);

    // Check when user resumes or switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && expiresAt && Date.now() >= expiresAt) {
        handleSessionExpired();
      }
    };

    // Custom event listener for 401 API responses
    window.addEventListener("techstorm:session-expired", handleSessionExpired);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("techstorm:session-expired", handleSessionExpired);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isAuthenticated, expiresAt, handleSessionExpired]);

  const handleLoginAgain = () => {
    const currentUrl = typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : pathname || "/";
    const targetUrl = `/login?reason=session_expired&callbackUrl=${encodeURIComponent(currentUrl)}`;
    window.location.href = targetUrl;
  };

  if (!isExpiredModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <i className="fas fa-clock-rotate-left text-2xl"></i>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Session Expired
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Your active session has expired. To protect your account and preserve your progress, please log in again to continue.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLoginAgain}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-brand-teal hover:bg-[#006066] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-in-alt"></i>
            <span>Log In Again</span>
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
