import { getStudentGrades } from "@/app/actions/mentee-grades";
import GradesView from "@/components/mentee/GradesView";

export const metadata = {
  title: "My Grades | TechStorm Global",
  description: "Track your academic performance and feedback."
};

export default async function GradesPage() {
  const { success, data } = await getStudentGrades();

  if (!success || !data) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-500">Failed to load grades</h2>
            <p className="text-slate-500">Please try again later.</p>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">My Grades</h1>
          <p className="text-slate-500 mt-1">Track your progress across all enrolled courses.</p>
        </div>
      </div>

      <GradesView gradebook={data} />
    </div>
  );
}
