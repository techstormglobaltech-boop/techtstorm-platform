import Image from "next/image";
import Link from "next/link";
import { getMenteeDashboardData } from "@/app/actions/learning";
import { getMenteeMeetings } from "@/app/actions/meetings";
import { getStudentAchievements } from "@/app/actions/achievements";

export default async function MenteeDashboard() {
  const [dashboardData, meetings, achievementsData] = await Promise.all([
    getMenteeDashboardData(),
    getMenteeMeetings(),
    getStudentAchievements()
  ]);

  if (!dashboardData) return null;

  const { user, jumpBackCourse, recommendations, totalCompletedLessons, streak } = dashboardData;
  
  // Use first 3 meetings
  const upcomingMeetings = meetings.slice(0, 3);
  
  // Use first 6 achievements (or just display a few)
  const achievements = achievementsData.success ? achievementsData.data.slice(0, 6) : [];

  return (
    <div className="space-y-8">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-dark to-slate-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || "Learner"}! 👋</h1>
            <p className="text-slate-300 mb-6 max-w-lg">You have completed <strong>{totalCompletedLessons}</strong> lessons so far. Keep up the momentum to earn your "Consistent Learner" badge!</p>
            <Link href="/mentee/my-courses" className="bg-brand-amber text-brand-dark font-bold px-6 py-3 rounded-lg hover:bg-[#e6a200] transition-colors inline-block">
                Continue Learning
            </Link>
        </div>
        <div className="hidden md:block relative z-10">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-brand-teal/30">
                <div className="text-center">
                    <span className="block text-2xl font-bold">{streak}</span>
                    <span className="text-xs text-slate-300">Day Streak</span>
                </div>
            </div>
        </div>
        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-brand-teal/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress & Courses */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Active Course */}
            <div>
                <h2 className="text-xl font-bold text-brand-dark mb-4">Jump Back In</h2>
                {jumpBackCourse ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-center">
                        <div className="w-full sm:w-48 h-32 bg-slate-200 rounded-lg relative overflow-hidden flex-shrink-0">
                            {jumpBackCourse.image ? (
                                <Image src={jumpBackCourse.image} alt="Course" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <i className="fas fa-image text-2xl"></i>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Link href={`/learn/${jumpBackCourse.id}`} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-brand-teal hover:scale-110 transition-transform">
                                    <i className="fas fa-play ml-1"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-brand-dark text-lg">{jumpBackCourse.title}</h3>
                                <span className="text-xs font-semibold bg-brand-teal/10 text-brand-teal px-2 py-1 rounded">
                                    {jumpBackCourse.progress === 100 ? "Completed" : "In Progress"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Next: {jumpBackCourse.nextLessonTitle}</p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-slate-600">
                                    <span>{jumpBackCourse.progress}% Completed</span>
                                    <span>{jumpBackCourse.completedLessons}/{jumpBackCourse.totalLessons} Lessons</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-teal transition-all duration-500" style={{ width: `${jumpBackCourse.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-dashed border-slate-200 text-center">
                        <p className="text-slate-500 mb-4">You haven't started any courses yet.</p>
                        <Link href="/courses" className="text-brand-teal font-bold hover:underline">Explore Courses</Link>
                    </div>
                )}
            </div>

            {/* Recommended for You */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-dark">Recommended For You</h2>
                    <Link href="/courses" className="text-sm text-brand-teal font-medium hover:underline">Explore All</Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                    {recommendations.map((course, i) => (
                        <Link key={course.id} href={`/courses/${course.id}`}>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                                <div className="h-32 bg-slate-200 rounded-lg mb-4 relative overflow-hidden">
                                    {course.image ? (
                                        <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <i className="fas fa-image text-xl"></i>
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-brand-dark mb-1 line-clamp-1 group-hover:text-brand-teal transition-colors">{course.title}</h4>
                                <p className="text-xs text-slate-500 mt-auto">{course.instructor?.name || "TechStorm Mentor"}</p>
                            </div>
                        </Link>
                    ))}
                    {recommendations.length === 0 && (
                        <p className="text-slate-400 text-sm italic">No new recommendations right now.</p>
                    )}
                </div>
            </div>

        </div>

        {/* Right Column: Schedule & Stats */}
        <div className="space-y-8">
            
            {/* Upcoming Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-brand-dark mb-4">Upcoming Schedule</h3>
                <div className="space-y-4">
                    {upcomingMeetings.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No upcoming sessions.</p>
                    ) : (
                        upcomingMeetings.map((meeting, i) => (
                            <div key={i} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg bg-brand-teal/10 text-brand-teal">
                                    <i className={`fas ${meeting.menteeId ? 'fa-user-friends' : 'fa-chalkboard-teacher'}`}></i>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-brand-dark text-sm">{meeting.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        {new Date(meeting.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Link href="/mentee/schedule" className="block text-center w-full mt-4 py-2 text-sm text-brand-teal font-medium border border-brand-teal/20 rounded-lg hover:bg-brand-teal/5 transition-colors">
                    View Calendar
                </Link>
            </div>

            {/* Achievements */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-brand-dark mb-4">Achievements</h3>
                <div className="grid grid-cols-3 gap-2">
                    {achievements.map((badge, i) => (
                        <div key={i} className={`flex flex-col items-center text-center p-3 rounded-lg ${!badge.unlockedAt ? 'bg-slate-50 opacity-60' : 'bg-slate-50'}`}>
                            <div className={`text-2xl mb-2 ${badge.unlockedAt ? badge.color.replace('bg-', 'text-') : 'text-slate-300'}`}>
                                <i className={`fas ${badge.icon}`}></i>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600 leading-tight">{badge.title}</span>
                        </div>
                    ))}
                    {achievements.length === 0 && <p className="text-sm text-slate-400 col-span-3">Start learning to earn badges!</p>}
                </div>
                <Link href="/mentee/achievements" className="block text-center mt-4 text-xs text-brand-teal hover:underline">View All</Link>
            </div>

        </div>
      </div>
    </div>
  );
}