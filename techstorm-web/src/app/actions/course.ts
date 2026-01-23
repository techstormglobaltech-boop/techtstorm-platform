"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CourseStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { generateCourseOutline } from "@/lib/ai";

export async function getCourses() {
  const session = await auth();
  if (!session?.user) return [];

  const isAdmin = session.user.role === "ADMIN";
  const userId = session.user.id;

  const courses = await db.course.findMany({
    where: isAdmin ? {} : { instructorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      instructor: {
        select: { name: true, email: true }
      },
      _count: {
        select: {
            modules: true,
            enrollments: true
        }
      }
    }
  });

  return courses;
}
export async function generateAICourse(topic: string, level: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const outline = await generateCourseOutline(topic, level);
  if (!outline) return { error: "AI Generation failed" };

  try {
    const course = await db.$transaction(async (tx) => {
      const newCourse = await tx.course.create({
        data: {
          title: outline.title,
          description: outline.description,
          instructorId: session.user.id!,
          status: CourseStatus.DRAFT,
          modules: {
            create: outline.modules.map((mod: any, index: number) => ({
              title: mod.title,
              position: index,
              lessons: {
                create: mod.lessons.map((lesson: any, lIndex: number) => ({
                  title: lesson.title,
                  description: lesson.description,
                  position: lIndex,
                  videoUrl: lesson.video_url || null,
                  quizzes: lesson.quiz ? {
                    create: {
                      title: lesson.quiz.title,
                      questions: {
                        create: lesson.quiz.questions.map((q: any) => ({
                          text: q.text,
                          correctAnswer: q.correct_answer,
                          options: {
                            create: q.options.map((opt: string) => ({
                              text: opt
                            }))
                          }
                        }))
                      }
                    }
                  } : undefined,
                  assignments: lesson.assignment ? {
                    create: {
                      title: lesson.assignment.title,
                      description: lesson.assignment.description
                    }
                  } : undefined
                }))
              }
            }))
          }
        }
      });
      return newCourse;
    });

    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("DATABASE SAVE ERROR:", error);
    return { error: `Failed to save generated course: ${error instanceof Error ? error.message : 'Unknown database error'}` };
  }
}

export async function createCourse(title: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.create({
      data: {
        title,
        instructorId: session.user.id,
        status: CourseStatus.DRAFT,
      }
    });
    
    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    return { error: "Failed to create course" };
  }
}

export async function deleteCourse(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await db.course.delete({
      where: { id }
    });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete course" };
  }
}

export async function toggleCourseStatus(id: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  try {
    await db.course.update({
      where: { id },
      data: { status: newStatus as CourseStatus }
    });
    revalidatePath("/admin/courses");
    revalidatePath("/mentor/courses");
    return { success: true, newStatus };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}
