import MenteeLayoutClient from "@/components/mentee/MenteeLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";

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

  if (!session?.user || session.error === "SessionExpired") {
    redirect("/login?reason=session_expired&callbackUrl=/mentee");
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
