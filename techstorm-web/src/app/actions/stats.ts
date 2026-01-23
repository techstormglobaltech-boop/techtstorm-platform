import { db } from "@/lib/db";

export async function getAdminStats() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Re-map arguments because Promise.all array destructuring is getting long/messy
  // A cleaner way would be to move this to a separate query or just use the array index.
  // Let's rely on the variable 'recentCourses' etc from above, but we need the ALL courses list for revenue.
  // Actually, I can't easily access arguments[12] like that in this context safely.
  
  // Let's refactor the Promise.all destructuring slightly to be safer.
  const allData = await Promise.all([
    db.course.count(),
    db.user.count({ where: { role: "MENTOR" } }),
    db.user.count({ where: { role: "MENTEE" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.course.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { instructor: { select: { name: true } } }
    }),
    db.user.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
    db.enrollment.findMany({ where: { enrolledAt: { gte: sevenDaysAgo } }, select: { enrolledAt: true } }),
    db.course.count({ where: { status: "REVIEW" } }),
    db.assignmentSubmission.count({ where: { status: "PENDING" } }),
    db.enrollment.findMany({ take: 5, orderBy: { enrolledAt: "desc" }, include: { user: { select: { name: true, image: true } }, course: { select: { title: true } } } }),
    db.assignmentSubmission.findMany({ take: 5, orderBy: { submittedAt: "desc" }, include: { user: { select: { name: true, image: true } }, assignment: { select: { title: true } } } }),
    db.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { name: true, image: true, role: true, createdAt: true } }),
    // New query: All courses for stats
    db.course.findMany({ select: { title: true, price: true, _count: { select: { enrollments: true } } } })
  ]);

  const [
    coursesCount, mentorsCount, menteesCount, adminsCount, recentCourses, 
    last7DaysUsers, last7DaysEnrollments, pendingCourseReviews, pendingGrading, 
    recentEnrollments, recentSubmissions, recentUsers, courseStats
  ] = allData;

  // Process Revenue & Top Course
  let totalRevenue = 0;
  let topCourse = { title: "No Courses Yet", enrollments: 0 };

  courseStats.forEach(c => {
    totalRevenue += (c.price || 0) * c._count.enrollments;
    if (c._count.enrollments > topCourse.enrollments) {
        topCourse = { title: c.title, enrollments: c._count.enrollments };
    }
  });

  // Process time-series data for charts
  const processDates = (data: any[], dateField: string) => {
    const counts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      counts[d.toISOString().split('T')[0]] = 0;
    }
    data.forEach(item => {
      const day = new Date(item[dateField]).toISOString().split('T')[0];
      if (counts[day] !== undefined) counts[day]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  };

  const userGrowth = processDates(last7DaysUsers, 'createdAt');
  const enrollmentTrends = processDates(last7DaysEnrollments, 'enrolledAt');

  // Combine and Sort Activity Feed
  const activityFeed = [
    ...recentEnrollments.map(e => ({
      type: "enrollment",
      user: e.user,
      title: `Enrolled in ${e.course.title}`,
      date: e.enrolledAt
    })),
    ...recentSubmissions.map(s => ({
      type: "submission",
      user: s.user,
      title: `Submitted ${s.assignment.title}`,
      date: s.submittedAt
    })),
    ...recentUsers.map(u => ({
      type: "registration",
      user: { name: u.name, image: u.image },
      title: `New ${u.role.toLowerCase()} registered`,
      date: u.createdAt
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return {
    coursesCount,
    mentorsCount,
    menteesCount,
    adminsCount,
    recentCourses,
    userGrowth,
    enrollmentTrends,
    roleDistribution: [
      { name: 'Admins', value: adminsCount },
      { name: 'Mentors', value: mentorsCount },
      { name: 'Mentees', value: menteesCount },
    ],
    pendingTasks: {
        reviews: pendingCourseReviews,
        grading: pendingGrading,
        total: pendingCourseReviews + pendingGrading
    },
    activityFeed,
    revenue: totalRevenue,
    topCourse
  };
}