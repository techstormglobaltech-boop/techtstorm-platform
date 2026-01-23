import { getStudentAchievements } from "@/app/actions/achievements";
import AchievementsView from "@/components/mentee/AchievementsView";

export const metadata = {
  title: "Achievements | TechStorm Global",
  description: "Track your learning milestones and badges."
};

export default async function AchievementsPage() {
  const { success, data } = await getStudentAchievements();

  if (!success || !data) {
    return (
        <div className="p-8 text-center text-red-500">
            Failed to load achievements.
        </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <AchievementsView achievements={data} />
    </div>
  );
}
