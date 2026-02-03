import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Sanitize user object to ensure serializability
  const sanitizedUser = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role,
  } : undefined;

  return (
    <AdminLayoutClient user={sanitizedUser}>
        {children}
    </AdminLayoutClient>
  );
}