"use client";

import { usePathname } from "next/navigation";
import MaintenancePage from "@/app/maintenance/page";

interface MaintenanceGuardProps {
  isMaintenance: boolean;
  isAdmin: boolean;
  children: React.ReactNode;
}

export default function MaintenanceGuard({ isMaintenance, isAdmin, children }: MaintenanceGuardProps) {
  const pathname = usePathname();

  // Allow access to login, register, and api routes even in maintenance mode
  const isExempt = 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/admin"); // Optional: Let them see the admin login if they bookmark it

  // If Maintenance is ON, user is NOT admin, and route is NOT exempt -> Show Maintenance Page
  if (isMaintenance && !isAdmin && !isExempt) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
