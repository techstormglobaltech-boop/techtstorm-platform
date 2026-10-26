import { getStudentsForMentor } from "@/app/actions/mentor-stats";
import StudentsManager from "@/components/mentor/StudentsManager";

export const metadata = {
  title: "Instructor Portal | My Students",
  description: "Manage and track student progress.",
};

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, students] = await Promise.all([
    searchParams,
    getStudentsForMentor(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">My Students</h1>
        <p className="text-slate-500 mt-1">Track student progress and approve paid course enrollment requests.</p>
      </div>

      <StudentsManager
        initialStudents={students}
        initialTab={tab === "PENDING" ? "PENDING" : "ACTIVE"}
      />
    </div>
  );
}
