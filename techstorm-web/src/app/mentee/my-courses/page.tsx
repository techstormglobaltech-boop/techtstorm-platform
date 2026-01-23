import { getMyCourses } from "@/app/actions/learning";
import MyCoursesList from "@/components/mentee/MyCoursesList";

export default async function MyCoursesPage() {
  const courses = await getMyCourses();

  return <MyCoursesList initialCourses={courses} />;
}
