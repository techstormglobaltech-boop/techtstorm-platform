import MenteesManager from "@/components/admin/MenteesManager";
import { getUsers } from "@/app/actions/user-management";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "TechStorm Admin | Mentees",
  description: "Track student progress and enrollment.",
};

export default async function MenteesPage() {
  const mentees = await getUsers(UserRole.MENTEE);
  return <MenteesManager initialMentees={mentees} />;
}
