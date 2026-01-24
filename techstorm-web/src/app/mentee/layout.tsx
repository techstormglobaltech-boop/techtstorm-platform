import MenteeLayoutClient from "@/components/mentee/MenteeLayoutClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    redirect("/login");
  }

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <MenteeLayoutClient user={session.user}>
        {children}
    </MenteeLayoutClient>
  );
}
