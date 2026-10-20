import MenteeLayoutClient from "@/components/mentee/MenteeLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "My Portal | TechStorm Global",
  description: "Manage your learning journey.",
};

export default async function MenteeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("MenteeLayout Auth Error:", error);
    redirect("/login?reason=session_expired&callbackUrl=/mentee");
  }

  const isExpired = session?.error === "SessionExpired";
  if (!session?.user || isExpired) {
    redirect(isExpired ? "/login?reason=session_expired&callbackUrl=/mentee" : "/login?callbackUrl=/mentee");
  }

  // Strict Role Check: Mentors should be redirected to their instructor portal
  if (session.user.role === UserRole.MENTOR) {
    redirect("/mentor");
  }

  const profile = await getMyProfile();
  const currentUser = {
    ...session.user,
    ...(profile?.name ? { name: profile.name } : {}),
    ...(profile?.image ? { image: profile.image } : {}),
  };

  return (
    <MenteeLayoutClient user={currentUser}>
      {children}
    </MenteeLayoutClient>
  );
}
