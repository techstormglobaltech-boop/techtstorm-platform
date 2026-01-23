"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateQuiz } from "@/lib/ai";

export async function getCourseForEdit(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      instructorId: session.user.id // Ensure ownership
    },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              quizzes: {
                include: {
                  questions: {
                    include: {
                      options: true
                    }
                  }
                }
              },
              assignments: true
            }
          }
        }
      }
    }
  });

  return course;
}

export async function updateCourseDetails(courseId: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.course.update({
      where: {
        id: courseId,
        instructorId: session.user.id
      },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
      }
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update course" };
  }
}

// MODULE ACTIONS
export async function createModule(courseId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { position: "desc" }
    });

    await db.module.create({
      data: {
        title,
        courseId,
        position: lastModule ? lastModule.position + 1 : 0
      }
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create module" };
  }
}

export async function deleteModule(moduleId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.module.delete({ where: { id: moduleId } });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete module" };
  }
}

// LESSON ACTIONS
export async function createLesson(moduleId: string, title: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: "desc" }
    });

    await db.lesson.create({
      data: {
        title,
        moduleId,
        position: lastLesson ? lastLesson.position + 1 : 0,
        isFree: false
      }
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create lesson" };
  }
}

export async function updateLesson(lessonId: string, data: any, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        isFree: data.isFree,
        duration: data.duration ? parseInt(data.duration) : null
      }
    });

    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.lesson.delete({ where: { id: lessonId } });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete lesson" };
  }
}

// QUIZ ACTIONS
export async function saveQuiz(lessonId: string, data: { title: string }, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const quiz = await db.quiz.upsert({
      where: { id: (data as any).id || "new" },
      update: { title: data.title },
      create: { title: data.title, lessonId }
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true, id: quiz.id };
  } catch (error) {
    return { error: "Failed to save quiz" };
  }
}

export async function generateQuizFromAI(lessonId: string, lessonTitle: string, courseId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const aiQuiz = await generateQuiz(lessonTitle);
    if (!aiQuiz) return { error: "AI Generation failed" };

    try {
        await db.$transaction(async (tx) => {
            // 1. Find or create quiz
            const existingQuiz = await tx.quiz.findFirst({
                where: { lessonId }
            });

            const quiz = existingQuiz 
                ? await tx.quiz.update({
                    where: { id: existingQuiz.id },
                    data: { title: aiQuiz.title }
                  })
                : await tx.quiz.create({
                    data: { title: aiQuiz.title, lessonId }
                  });

            // 2. Add questions
            await tx.question.createMany({
                data: aiQuiz.questions.map((q: any) => ({
                    quizId: quiz.id,
                    text: q.text,
                    correctAnswer: q.correct_answer
                }))
            });

            // Note: Prisma's createMany doesn't return IDs, so we can't easily do options in one go 
            // without a loop or separate queries. Let's do it individually for the options to ensure 
            // they are linked to the correct questions.
            
            // Re-fetch questions to get their IDs
            const savedQuestions = await tx.question.findMany({
                where: { quizId: quiz.id },
                orderBy: { id: 'desc' },
                take: aiQuiz.questions.length
            });

            // Map AI questions to saved questions by text to match options
            for (const aiQ of aiQuiz.questions) {
                const savedQ = savedQuestions.find(sq => sq.text === aiQ.text);
                if (savedQ) {
                    await tx.option.createMany({
                        data: aiQ.options.map((opt: string) => ({
                            questionId: savedQ.id,
                            text: opt
                        }))
                    });
                }
            }
        });

        revalidatePath(`/mentor/courses/${courseId}`);
        return { success: true };
    } catch (error) {
        console.error("AI QUIZ SAVE ERROR:", error);
        return { error: "Failed to save AI quiz" };
    }
}

export async function addQuestion(quizId: string, data: any, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.question.create({
      data: {
        quizId,
        text: data.text,
        correctAnswer: data.correctAnswer,
        options: {
          create: data.options.map((opt: string) => ({ text: opt }))
        }
      }
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to add question" };
  }
}

export async function deleteQuestion(questionId: string, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.question.delete({ where: { id: questionId } });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete question" };
  }
}

// ASSIGNMENT ACTIONS
export async function saveAssignment(lessonId: string, data: { title: string, description: string }, courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.assignment.upsert({
      where: { id: (data as any).id || "new" },
      update: { title: data.title, description: data.description },
      create: { title: data.title, description: data.description, lessonId }
    });
    revalidatePath(`/mentor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to save assignment" };
  }
}
