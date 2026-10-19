import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    redirect("/login?reason=session_expired&callbackUrl=/admin");
  }

  if (!session?.user || session.error === "SessionExpired") {
    redirect("/login?reason=session_expired&callbackUrl=/admin");
  }

  // Sanitize user object to ensure serializability
  const sanitizedUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role,
  };

  return (
    <AdminLayoutClient user={sanitizedUser}>
      {children}
    </AdminLayoutClient>
  );
}