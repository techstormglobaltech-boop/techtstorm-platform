import MentorCoursesManager from "@/components/mentor/MentorCoursesManager";
import { getCourses } from "@/app/actions/course";

export default async function MentorCoursesPage() {
  const courses = await getCourses();
  
  return <MentorCoursesManager initialCourses={courses} />;
}
