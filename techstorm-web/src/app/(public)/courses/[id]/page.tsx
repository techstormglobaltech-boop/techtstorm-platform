import { getCourseById } from "@/app/actions/public-course";
import CourseDetail from "@/components/public/CourseDetail";
import { auth } from "@/auth";
import { checkEnrollment } from "@/app/actions/enrollment";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses',
};

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const course = await getCourseById(id);

  let isEnrolled = false;
  let enrollmentStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;
  let paymentReference: string | null = null;

  if (session?.user?.id) {
    const enrollment = await checkEnrollment(id);
    isEnrolled = enrollment.isEnrolled;
    enrollmentStatus = enrollment.status;
    paymentReference = enrollment.paymentReference ?? null;
  }

  return (
    <CourseDetail 
      course={course} 
      isEnrolled={isEnrolled} 
      enrollmentStatus={enrollmentStatus}
      initialPaymentRef={paymentReference}
    />
  );
}
