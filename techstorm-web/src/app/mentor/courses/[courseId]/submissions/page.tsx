import { getSubmissionsForMentor } from "@/app/actions/submissions";
import SubmissionsManager from "@/components/mentor/SubmissionsManager";
import Link from "next/link";

export default async function SubmissionsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const submissions = await getSubmissionsForMentor(courseId);

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/mentor/courses" className="text-slate-400 hover:text-brand-dark transition-colors">
                <i className="fas fa-arrow-left"></i>
            </Link>
            <h1 className="text-2xl font-bold text-brand-dark">Student Submissions</h1>
        </div>
        
        <SubmissionsManager initialSubmissions={submissions} courseId={courseId} />
    </div>
  );
}
