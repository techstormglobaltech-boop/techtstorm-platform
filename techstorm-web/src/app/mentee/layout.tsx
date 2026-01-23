import MenteeLayoutClient from "@/components/mentee/MenteeLayoutClient";
import { auth } from "@/auth";

export const metadata = {
  title: "My Portal | TechStorm Global",
  description: "Manage your learning journey.",
};

export default async function MenteeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <MenteeLayoutClient user={session?.user}>
        {children}
    </MenteeLayoutClient>
  );
}
