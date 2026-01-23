import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async getAdminDashboardStats(role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allData = await Promise.all([
      this.prisma.course.count(),
      this.prisma.user.count({ where: { role: 'MENTOR' } }),
      this.prisma.user.count({ where: { role: 'MENTEE' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.course.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { instructor: { select: { name: true } } },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.enrollment.findMany({
        where: { enrolledAt: { gte: sevenDaysAgo } },
        select: { enrolledAt: true },
      }),
      this.prisma.course.count({ where: { status: 'REVIEW' } }),
      this.prisma.assignmentSubmission.count({ where: { status: 'PENDING' } }),
      this.prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.assignmentSubmission.findMany({
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: { select: { name: true, image: true } },
          assignment: { select: { title: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, image: true, role: true, createdAt: true },
      }),
      this.prisma.course.findMany({
        select: {
          title: true,
          price: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

    const [
      coursesCount,
      mentorsCount,
      menteesCount,
      adminsCount,
      recentCourses,
      last7DaysUsers,
      last7DaysEnrollments,
      pendingCourseReviews,
      pendingGrading,
      recentEnrollments,
      recentSubmissions,
      recentUsers,
      courseStats,
    ] = allData;

    // Process Revenue & Top Course
    let totalRevenue = 0;
    let topCourse = { title: 'No Courses Yet', enrollments: 0 };

    courseStats.forEach((c) => {
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
      data.forEach((item) => {
        const day = new Date(item[dateField]).toISOString().split('T')[0];
        if (counts[day] !== undefined) counts[day]++;
      });
      return Object.entries(counts).map(([date, count]) => ({ date, count }));
    };

    const userGrowth = processDates(last7DaysUsers, 'createdAt');
    const enrollmentTrends = processDates(last7DaysEnrollments, 'enrolledAt');

    // Combine and Sort Activity Feed
    const activityFeed = [
      ...recentEnrollments.map((e) => ({
        type: 'enrollment',
        user: e.user,
        title: `Enrolled in ${e.course.title}`,
        date: e.enrolledAt,
      })),
      ...recentSubmissions.map((s) => ({
        type: 'submission',
        user: s.user,
        title: `Submitted ${s.assignment.title}`,
        date: s.submittedAt,
      })),
      ...recentUsers.map((u) => ({
        type: 'registration',
        user: { name: u.name, image: u.image },
        title: `New ${u.role.toLowerCase()} registered`,
        date: u.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

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
        total: pendingCourseReviews + pendingGrading,
      },
      activityFeed,
      revenue: totalRevenue,
      topCourse,
    };
  }

  async getMentorStats(mentorId: string) {
    const [coursesCount, studentCount, quizAttempts, lessonProgress] =
      await Promise.all([
        this.prisma.course.count({ where: { instructorId: mentorId } }),
        this.prisma.enrollment.count({
          where: {
            course: { instructorId: mentorId },
          },
        }),
        this.prisma.quizAttempt.findMany({
          where: {
            quiz: {
              lesson: {
                module: { course: { instructorId: mentorId } },
              },
            },
          },
          select: { score: true, totalQuestions: true },
        }),
        this.prisma.lessonProgress.findMany({
          where: {
            lesson: {
              module: { course: { instructorId: mentorId } },
            },
          },
        }),
      ]);

    const recentEnrollments = await this.prisma.enrollment.findMany({
      where: {
        course: { instructorId: mentorId },
      },
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });

    // Calculate Avg Score
    const avgScore =
      quizAttempts.length > 0
        ? (quizAttempts.reduce(
            (acc, curr) => acc + curr.score / curr.totalQuestions,
            0,
          ) /
            quizAttempts.length) *
          100
        : 0;

    // Calculate Completion Rate
    const totalCompleted = lessonProgress.filter((p) => p.isCompleted).length;
    const completionRate =
      lessonProgress.length > 0
        ? (totalCompleted / lessonProgress.length) * 100
        : 0;

    // Fetch AI Insights
    const aiInsights = await this.aiService.generateMentorInsights({
      course_title: 'Your Published Portfolio',
      student_count: studentCount,
      avg_quiz_score: Math.round(avgScore),
      completion_rate: Math.round(completionRate),
    });

    return {
      coursesCount,
      studentCount,
      recentEnrollments,
      avgScore: Math.round(avgScore),
      completionRate: Math.round(completionRate),
      aiInsights,
    };
  }

  async getPlatformReports(role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();

    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCompletedLessons,
      totalLessons,
      categoryCounts
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.lessonProgress.count({ where: { isCompleted: true } }),
      this.prisma.lesson.count(),
      this.prisma.course.groupBy({
        by: ['category'],
        _count: { id: true }
      })
    ]);

    const completionRate = totalLessons > 0 ? (totalCompletedLessons / totalLessons) * 100 : 0;
    
    const topCategories = categoryCounts.map(c => ({
      name: c.category || 'Uncategorized',
      count: c._count.id
    }));

    const aiInsights = await this.aiService.generatePlatformInsights({
      total_users: totalUsers,
      total_courses: totalCourses,
      total_enrollments: totalEnrollments,
      completion_rate: Math.round(completionRate),
      top_categories: topCategories
    });

    const recentCompletions = await this.prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });

    return {
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completionRate: Math.round(completionRate),
        revenue: 0 
      },
      topCategories,
      aiInsights,
      recentCompletions
    };
  }
}
