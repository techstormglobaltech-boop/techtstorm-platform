import Reveal from "@/components/ui/Reveal";
import { getPublishedCourses } from "@/app/actions/public-course";
import CourseList from "@/components/public/CourseList";

export const metadata = {
  title: "TechStorm | Explore Courses",
  description: "Browse our extensive catalog of tech courses.",
};

export default async function Courses() {
  const courses = await getPublishedCourses();

  return (
    <>
      {/* HEADER */}
      <section className="bg-brand-dark text-white pt-32 pb-20 text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Courses</h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg opacity-80">Master the skills that matter today.</p>
            </Reveal>
        </div>
      </section>

      <CourseList initialCourses={courses} />
    </>
  );
}
