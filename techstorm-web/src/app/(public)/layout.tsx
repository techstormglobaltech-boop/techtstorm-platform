import GlassNavbar from "@/components/new-ui/GlassNavbar";
import Footer from "@/components/new-ui/Footer";
import { auth } from "@/auth";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("PublicLayout Auth Error:", error);
  }

  return (
    <div className="flex flex-col min-h-screen pt-20 relative">
      <GlassNavbar user={session?.user} />
      <main className="flex-grow mt-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
