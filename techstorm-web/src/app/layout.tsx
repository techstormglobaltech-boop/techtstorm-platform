import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { auth } from "@/auth";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getMaintenanceMode } from "@/app/actions/settings";
import NextTopLoader from 'nextjs-toploader';

export const dynamic = "force-dynamic";

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
  const isMaintenance = await getMaintenanceMode();

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body
        className={`${poppins.variable} antialiased font-sans bg-gray-50 text-slate-800`}
      >
        <NextTopLoader 
          color="#008080"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #008080,0 0 5px #008080"
        />
        <Toaster position="top-right" />
        <MaintenanceGuard isMaintenance={isMaintenance} isAdmin={isAdmin}>
            {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}