import MenteesManager from "@/components/admin/MenteesManager";
import { getUsers } from "@/app/actions/user-management";

export const metadata = {
  title: "TechStorm Admin | Mentees",
  description: "Track student progress and enrollment.",
};

export default async function MenteesPage() {
  const mentees = await getUsers("MENTEE");
  return <MenteesManager initialMentees={mentees} />;
}
