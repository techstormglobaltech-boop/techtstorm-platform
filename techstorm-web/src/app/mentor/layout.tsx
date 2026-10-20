import MentorLayoutClient from "@/components/mentor/MentorLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Instructor Portal | TechStorm Global",
  description: "Manage your courses and students.",
};

export default async function MentorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    redirect("/login?reason=session_expired&callbackUrl=/mentor");
  }

  const isExpired = session?.error === "SessionExpired";
  if (!session?.user || isExpired) {
    redirect(isExpired ? "/login?reason=session_expired&callbackUrl=/mentor" : "/login?callbackUrl=/mentor");
  }

  // Strict Role Check: Only MENTOR or ADMIN may access the instructor portal
  if (session.user.role !== UserRole.MENTOR && session.user.role !== UserRole.ADMIN) {
    redirect("/mentee");
  }

  const profile = await getMyProfile();
  const currentUser = {
    ...session.user,
    ...(profile?.name ? { name: profile.name } : {}),
    ...(profile?.image ? { image: profile.image } : {}),
  };

  return (
    <MentorLayoutClient user={currentUser}>
      {children}
    </MentorLayoutClient>
  );
}
