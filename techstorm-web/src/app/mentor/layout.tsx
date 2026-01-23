import MentorLayoutClient from "@/components/mentor/MentorLayoutClient";
import { auth } from "@/auth";

export const metadata = {
  title: "Instructor Portal | TechStorm Global",
  description: "Manage your courses and students.",
};

export default async function MentorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <MentorLayoutClient user={session?.user}>
        {children}
    </MentorLayoutClient>
  );
}
