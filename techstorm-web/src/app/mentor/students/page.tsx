import { getStudentsForMentor } from "@/app/actions/mentor-stats";
import StudentsManager from "@/components/mentor/StudentsManager";

export const metadata = {
  title: "Instructor Portal | My Students",
  description: "Manage and track student progress.",
};

export default async function StudentsPage() {
  const students = await getStudentsForMentor();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">My Students</h1>
        <p className="text-slate-500 mt-1">Track student progress and performance across your courses.</p>
      </div>

      <StudentsManager initialStudents={students} />
    </div>
  );
}
