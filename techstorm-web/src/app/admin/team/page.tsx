import { getTeamMembers } from "@/app/actions/team";
import TeamManager from "@/components/admin/TeamManager";

export const metadata = {
  title: "TechStorm Admin | Team",
  description: "Manage leadership team and public profiles.",
};

export default async function TeamPage() {
  const members = await getTeamMembers();
  return <TeamManager initialMembers={members} />;
}
