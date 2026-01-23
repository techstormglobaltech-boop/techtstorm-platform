"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getStudentGrades() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const userId = session.user.id;

    // Fetch enrollments with full course hierarchy (Modules -> Lessons -> Quizzes/Assignments)
    // AND fetch the user's specific attempts/submissions for those items.
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    quizzes: {
                        include: {
                            attempts: {
                                where: { userId },
                                orderBy: { score: 'desc' }, // Get best score
                                take: 1
                            }
                        }
                    },
                    assignments: {
                        include: {
                            submissions: {
                                where: { userId },
                                take: 1
                            }
                        }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform data into a flat "Gradebook" structure per course
    const gradebook = enrollments.map(enrollment => {
      const course = enrollment.course;
      const quizzes = [];
      const assignments = [];

      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
            // Process Quizzes
            lesson.quizzes.forEach(quiz => {
                const attempt = quiz.attempts[0]; // Best attempt
                if (quiz) {
                    quizzes.push({
                        id: quiz.id,
                        title: quiz.title,
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                        score: attempt ? attempt.score : null,
                        totalQuestions: attempt ? attempt.totalQuestions : null,
                        percentage: attempt ? Math.round((attempt.score / attempt.totalQuestions) * 100) : null,
                        status: attempt ? "Completed" : "Not Started",
                        date: attempt ? attempt.completedAt : null
                    });
                }
            });

            // Process Assignments
            lesson.assignments.forEach(assign => {
                const submission = assign.submissions[0];
                if (assign) {
                    assignments.push({
                        id: assign.id,
                        title: assign.title,
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                        status: submission ? submission.status : "Not Submitted",
                        grade: submission?.grade || null,
                        feedback: submission?.feedback || null,
                        submittedAt: submission?.submittedAt || null
                    });
                }
            });
        });
      });

      // Calculate aggregates
      const completedQuizzes = quizzes.filter(q => q.status === "Completed");
      const avgQuizScore = completedQuizzes.length > 0
        ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / completedQuizzes.length)
        : 0;
        
      const gradedAssignments = assignments.filter(a => a.status === "GRADED");

      return {
        courseId: course.id,
        courseTitle: course.title,
        courseImage: course.image,
        stats: {
            avgQuizScore,
            quizzesCompleted: completedQuizzes.length,
            totalQuizzes: quizzes.length,
            assignmentsSubmitted: assignments.filter(a => a.status !== "Not Submitted").length,
            totalAssignments: assignments.length
        },
        quizzes,
        assignments
      };
    });

    return { success: true, data: gradebook };
  } catch (error) {
    console.error("Error fetching grades:", error);
    return { success: false, error: "Failed to load grades" };
  }
}
