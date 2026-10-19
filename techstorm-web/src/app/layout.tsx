import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { auth } from "@/auth";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getMaintenanceMode } from "@/app/actions/settings";
import NextTopLoader from 'nextjs-toploader';
import { CookieConsentProvider } from "@/components/ui/CookieConsentProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SessionWatcher from "@/components/auth/SessionWatcher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | TechStorm Global",
    default: "TechStorm Global | Mentorship & Growth",
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className="font-sans antialiased transition-colors duration-300 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50"
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <CookieConsentProvider>
            <GoogleAnalytics />
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
            <SessionWatcher 
              expiresAt={session?.expiresAt} 
              isAuthenticated={!!session?.user} 
            />
            <MaintenanceGuard isMaintenance={isMaintenance} isAdmin={isAdmin}>
                {children}
            </MaintenanceGuard>
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
