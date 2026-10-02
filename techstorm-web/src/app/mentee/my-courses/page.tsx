import { getMyCourses } from "@/app/actions/learning";
import MyCoursesList from "@/components/mentee/MyCoursesList";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentee - My Courses',
};


export default async function MyCoursesPage() {
  const courses = await getMyCourses();

  return <MyCoursesList initialCourses={courses} />;
}
