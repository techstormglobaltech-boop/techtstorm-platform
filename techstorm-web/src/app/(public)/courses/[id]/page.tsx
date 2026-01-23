import { getCourseById } from "@/app/actions/public-course";
import CourseDetail from "@/components/public/CourseDetail";
import { auth } from "@/auth";
import { checkEnrollment } from "@/app/actions/enrollment";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const course = await getCourseById(id);

  let isEnrolled = false;
  if (session?.user?.id) {
    isEnrolled = await checkEnrollment(id);
  }

  return <CourseDetail course={course} isEnrolled={isEnrolled} />;
}
