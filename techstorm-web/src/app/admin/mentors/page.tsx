import MentorsManager from "@/components/admin/MentorsManager";
import { getUsers } from "@/app/actions/user-management";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "TechStorm Admin | Mentors",
  description: "Manage mentors and their assignments.",
};

export default async function MentorsPage() {
  const mentors = await getUsers(UserRole.MENTOR);
  return <MentorsManager initialMentors={mentors} />;
}
