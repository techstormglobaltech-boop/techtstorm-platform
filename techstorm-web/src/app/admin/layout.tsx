import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <AdminLayoutClient user={session?.user}>
        {children}
    </AdminLayoutClient>
  );
}