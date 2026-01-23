"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getMyCourses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = session.user.id;

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          modules: {
            include: {
              lessons: {
                select: {
                  id: true,
                  userProgress: {
                    where: { userId: userId }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });

  const coursesWithProgress = enrollments.map(enrollment => {
    let totalLessons = 0;
    let completedLessons = 0;

    enrollment.course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.userProgress?.[0]?.isCompleted) {
          completedLessons++;
        }
      });
    });

    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      image: enrollment.course.image,
      category: enrollment.course.category,
      instructor: enrollment.course.instructor,
      enrolledAt: enrollment.enrolledAt,
      progress,
      totalLessons,
      completedLessons
    };
  });

  return coursesWithProgress;
}

export async function getMenteeDashboardData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // 1. Fetch most recent enrollment for "Jump Back In"
  const recentEnrollment = await db.enrollment.findFirst({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  userProgress: {
                    where: { userId }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });

  let jumpBackCourse = null;
  if (recentEnrollment) {
    let totalLessons = 0;
    let completedLessons = 0;
    let lastLesson = null;

    recentEnrollment.course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.userProgress?.[0]?.isCompleted) {
          completedLessons++;
        } else if (!lastLesson) {
          lastLesson = lesson; // Simple "next lesson" logic
        }
      });
    });

    const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

    jumpBackCourse = {
      id: recentEnrollment.course.id,
      title: recentEnrollment.course.title,
      image: recentEnrollment.course.image,
      progress,
      totalLessons,
      completedLessons,
      nextLessonTitle: lastLesson ? (lastLesson as any).title : "Course Completed"
    };
  }

  // 2. Fetch recommendations (simple: latest published courses user isn't in)
  const recommendations = await db.course.findMany({
    where: {
      status: "PUBLISHED",
      enrollments: {
        none: { userId }
      }
    },
    take: 2,
    include: {
      instructor: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // 3. Simple Streak & Overall Progress Calculation
  // (In a real app, you'd check lessonProgress 'updatedAt' dates)
  const totalCompletedAcrossAll = await db.lessonProgress.count({
    where: { userId, isCompleted: true }
  });

  return {
    user: {
      name: session.user.name,
    },
    jumpBackCourse,
    recommendations,
    totalCompletedLessons: totalCompletedAcrossAll,
    streak: 1 // Placeholder for now
  };
}
