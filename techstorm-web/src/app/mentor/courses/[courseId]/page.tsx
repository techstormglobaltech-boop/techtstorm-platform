import { getCourseForEdit } from "@/app/actions/course-edit";
import CourseEditor from "@/components/mentor/CourseEditor";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentor - Courses',
};


export default async function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourseForEdit(courseId);

  if (!course) {
    redirect("/mentor/courses");
  }

  return <CourseEditor course={course} />;
}
