import CoursesManager from "@/components/admin/CoursesManager";
import { getCourses } from "@/app/actions/course";

export const metadata = {
  title: "TechStorm Admin | Courses",
  description: "Manage learning materials and courses.",
};

export default async function CoursesPage() {
  const courses = await getCourses();
  
  return <CoursesManager initialCourses={courses} />;
}
