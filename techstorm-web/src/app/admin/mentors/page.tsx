import MentorsManager from "@/components/admin/MentorsManager";
import { getUsers } from "@/app/actions/user-management";

export const metadata = {
  title: "TechStorm Admin | Mentors",
  description: "Manage mentors and their assignments.",
};

export default async function MentorsPage() {
  const mentors = await getUsers("MENTOR");
  return <MentorsManager initialMentors={mentors} />;
}
