import { getMentorMeetings } from "@/app/actions/meetings";
import { getCourses } from "@/app/actions/course";
import MentorScheduleManager from "@/components/mentor/MentorScheduleManager";

export const metadata = {
  title: "Instructor Portal | My Schedule",
  description: "Schedule and manage your live sessions.",
};

export default async function SchedulePage() {
  const [meetings, courses] = await Promise.all([
    getMentorMeetings(),
    getCourses()
  ]);

  // Only allow scheduling for published courses
  const publishedCourses = courses.filter((c: any) => c.status === "PUBLISHED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">My Schedule</h1>
        <p className="text-slate-500 mt-1">Manage your upcoming live sessions and 1:1 mentorship calls.</p>
      </div>

      <MentorScheduleManager 
        initialMeetings={meetings} 
        courses={publishedCourses} 
      />
    </div>
  );
}