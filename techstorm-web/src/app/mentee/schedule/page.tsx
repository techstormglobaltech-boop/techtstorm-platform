import { getMenteeMeetings, getEnrolledCourses } from "@/app/actions/meetings";
import MenteeScheduleView from "@/components/mentee/MenteeScheduleView";

export const metadata = {
  title: "My Portal | My Schedule",
  description: "View and join your live learning sessions.",
};

export default async function MenteeSchedulePage() {
  const meetings = await getMenteeMeetings();
  const courses = await getEnrolledCourses();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">My Schedule</h1>
        <p className="text-slate-500 mt-1">Don't miss your live sessions and Q&A calls with mentors.</p>
      </div>

      <MenteeScheduleView initialMeetings={meetings} courses={courses} />
    </div>
  );
}
