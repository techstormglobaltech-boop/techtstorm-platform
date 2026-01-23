"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getCourseContent(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              userProgress: {
                where: { userId: session.user.id }
              },
              quizzes: {
                include: {
                  questions: {
                    include: {
                      options: true
                    }
                  }
                }
              },
              assignments: {
                include: {
                  submissions: {
                    where: { userId: session.user.id }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) return null;

  // Calculate overall progress
  let completedCount = 0;
  let totalCount = 0;

  course.modules.forEach(mod => {
    mod.lessons.forEach(lesson => {
      totalCount++;
      if (lesson.userProgress.length > 0 && lesson.userProgress[0].isCompleted) {
        completedCount++;
      }
    });
  });

  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    ...course,
    progress,
    totalLessons: totalCount,
    completedLessons: completedCount
  };
}

export async function markLessonComplete(lessonId: string, completed: boolean = true) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      update: { isCompleted: completed },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        isCompleted: completed
      }
    });
    
    revalidatePath("/learn/[id]");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update progress" };
  }
}
