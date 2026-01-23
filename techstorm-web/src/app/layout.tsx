import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import MaintenanceGuard from "@/components/MaintenanceGuard";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TechStorm Global | Mentorship & Growth",
  description: "Join TechStorm to connect with experts in AI, Data Science, and Programming. Empowering you to learn, grow, and lead.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("RootLayout Auth Error:", error);
    // Continue rendering without session if auth fails
  }
  
  const isAdmin = session?.user?.role === "ADMIN";

  // Check Maintenance Mode
  let isMaintenance = false;
  try {
    const settings = await db.globalSetting.findUnique({ where: { id: "system_settings" } });
    isMaintenance = !!settings?.maintenanceMode;
  } catch (e) {
    // Ignore DB errors during build
  }

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${poppins.variable} antialiased font-sans bg-gray-50 text-slate-800`}
      >
        <Toaster position="top-right" />
        <MaintenanceGuard isMaintenance={isMaintenance} isAdmin={isAdmin}>
            {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}