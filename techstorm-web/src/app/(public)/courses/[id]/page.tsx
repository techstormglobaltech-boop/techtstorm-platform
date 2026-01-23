import { getCourseById } from "@/app/actions/public-course";
import CourseDetail from "@/components/public/CourseDetail";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const course = await getCourseById(id);

  let isEnrolled = false;
  if (session?.user?.id) {
    const enrollment = await db.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: id
            }
        }
    });
    isEnrolled = !!enrollment;
  }

  return <CourseDetail course={course} isEnrolled={isEnrolled} />;
}
