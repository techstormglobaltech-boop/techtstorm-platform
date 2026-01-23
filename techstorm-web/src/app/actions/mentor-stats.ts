"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

export async function getMentorStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const mentorId = session.user.id;

  const [coursesCount, studentCount, quizAttempts, lessonProgress] = await Promise.all([
    db.course.count({ where: { instructorId: mentorId } }),
    db.enrollment.count({
      where: {
        course: { instructorId: mentorId }
      }
    }),
    db.quizAttempt.findMany({
        where: { quiz: { lesson: { module: { course: { instructorId: mentorId } } } } },
        select: { score: true, totalQuestions: true }
    }),
    db.lessonProgress.findMany({
        where: { lesson: { module: { course: { instructorId: mentorId } } } }
    })
  ]);

  const recentEnrollments = await db.enrollment.findMany({
    where: {
      course: { instructorId: mentorId }
    },
    take: 5,
    orderBy: { enrolledAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } }
    }
  });

  // Calculate Avg Score
  const avgScore = quizAttempts.length > 0 
    ? (quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / quizAttempts.length) * 100
    : 0;

  // Calculate Completion Rate
  const totalCompleted = lessonProgress.filter(p => p.isCompleted).length;
  const completionRate = lessonProgress.length > 0 ? (totalCompleted / lessonProgress.length) * 100 : 0;

  // Fetch AI Insights
  let aiInsights = {
    summary: "Collecting student performance data...",
    insights: ["Calculating average scores...", "Reviewing course engagement..."],
    recommendation: "Our AI assistant is currently analyzing your teaching metrics."
  };

  try {
    const aiResponse = await fetch(`${AI_ENGINE_URL}/api/v1/reports/generate-mentor-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course_title: "Your Published Portfolio",
            student_count: studentCount,
            avg_quiz_score: Math.round(avgScore),
            completion_rate: Math.round(completionRate)
        })
    });

    if (aiResponse.ok) {
        aiInsights = await aiResponse.json();
    }
  } catch (error) {
    console.error("Mentor AI Insight Error:", error);
  }

  return {
    coursesCount,
    studentCount,
    recentEnrollments,
    avgScore: Math.round(avgScore),
    completionRate: Math.round(completionRate),
    aiInsights
  };
}

export async function getStudentsForMentor() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const mentorId = session.user.id;

  // Find all enrollments in courses taught by this mentor that are PUBLISHED
  const enrollments = await db.enrollment.findMany({
    where: {
      course: {
        instructorId: mentorId,
        status: "PUBLISHED" // Only show students in published courses
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true
        }
      },
      course: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  // Group by user to show unique students
  const studentMap = new Map();

  for (const enrollment of enrollments) {
    const studentId = enrollment.user.id;
    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        ...enrollment.user,
        enrolledCourses: []
      });
    }

    // To get real progress, we need lesson progress for THIS user and THIS course
    const lessons = await db.lesson.findMany({
        where: { module: { courseId: enrollment.courseId } },
        include: {
            userProgress: {
                where: { userId: studentId }
            }
        }
    });

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.userProgress?.[0]?.isCompleted).length;
    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    // Fetch Quiz Attempts for this student in this course
    const quizAttempts = await db.quizAttempt.findMany({
        where: { 
            userId: studentId,
            quiz: { lesson: { module: { courseId: enrollment.courseId } } }
        },
        include: { quiz: { select: { title: true } } }
    });

    // Fetch Assignment Submissions for this student in this course
    const submissions = await db.assignmentSubmission.findMany({
        where: {
            userId: studentId,
            assignment: { lesson: { module: { courseId: enrollment.courseId } } }
        },
        include: { assignment: { select: { title: true } } }
    });

    studentMap.get(studentId).enrolledCourses.push({
      id: enrollment.course.id,
      title: enrollment.course.title,
      enrolledAt: enrollment.enrolledAt,
      progress,
      quizAttempts,
      submissions
    });
  }

  return Array.from(studentMap.values());
}
