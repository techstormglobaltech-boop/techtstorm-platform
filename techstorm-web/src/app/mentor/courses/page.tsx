import MentorCoursesManager from "@/components/mentor/MentorCoursesManager";
import { getCourses } from "@/app/actions/course";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentor - Courses',
};


export default async function MentorCoursesPage() {
  const courses = await getCourses();
  
  return <MentorCoursesManager initialCourses={courses} />;
}
