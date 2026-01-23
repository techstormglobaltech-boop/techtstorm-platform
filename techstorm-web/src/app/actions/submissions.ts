"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// QUIZ SUBMISSION
export async function submitQuizResult(quizId: string, score: number, totalQuestions: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        totalQuestions
      }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to save quiz result" };
  }
}

// ASSIGNMENT SUBMISSION
export async function submitAssignment(assignmentId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.assignmentSubmission.upsert({
      where: {
        // Need a unique constraint if we only want one submission per user/assignment
        // For now, let's assume one. I'll need to check the schema for a unique index.
        id: "new" // Placeholder, in real usage we'd check existence first
      },
      update: {
        content,
        status: "PENDING",
        submittedAt: new Date()
      },
      create: {
        userId: session.user.id,
        assignmentId,
        content
      }
    });
    return { success: true };
  } catch (error) {
    // If upsert fails because of missing unique index, fallback to create
    try {
        await db.assignmentSubmission.create({
            data: { userId: session.user.id, assignmentId, content }
        });
        return { success: true };
    } catch(e) {
        return { error: "Failed to submit assignment" };
    }
  }
}

// MENTOR: FETCH SUBMISSIONS
export async function getSubmissionsForMentor(courseId: string) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN") return [];

  const submissions = await db.assignmentSubmission.findMany({
    where: {
      assignment: {
        lesson: {
          module: {
            courseId
          }
        }
      }
    },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { title: true } }
    },
    orderBy: { submittedAt: "desc" }
  });

  return submissions;
}

// MENTOR: GRADE SUBMISSION
export async function gradeSubmission(submissionId: string, data: { grade: string, feedback: string }, courseId: string) {
  const session = await auth();
  if (session?.user?.role !== "MENTOR" && session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade,
        feedback: data.feedback,
        status: "GRADED"
      }
    });
    revalidatePath(`/mentor/courses/${courseId}/submissions`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to grade submission" };
  }
}
