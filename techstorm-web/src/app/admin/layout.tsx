import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/user";

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

  const isExpired = session?.error === "SessionExpired";
  if (!session?.user || isExpired) {
    redirect(isExpired ? "/login?reason=session_expired&callbackUrl=/admin" : "/login?callbackUrl=/admin");
  }

  // Strict Role Check: Only ADMIN may access the admin portal
  if (session.user.role !== UserRole.ADMIN) {
    if (session.user.role === UserRole.MENTOR) {
      redirect("/mentor");
    }
    redirect("/mentee");
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
