"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date | null; // null if locked
  progress: number; // 0 to 100
};

export async function getStudentAchievements() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = session.user.id;

  try {
    // 1. Fetch User Stats
    const stats = await db.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: {
                      include: {
                        userProgress: { where: { userId, isCompleted: true } },
                        quizzes: {
                          include: {
                            attempts: { where: { userId } }
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
      }
    });

    if (!stats) return { success: false, error: "User not found" };

    // 2. Calculate Derived Stats
    let completedLessons = 0;
    let perfectQuizzes = 0;
    let completedCourses = 0;
    let totalEnrollments = stats.enrollments.length;

    stats.enrollments.forEach(enrollment => {
        let courseLessons = 0;
        let courseCompletedLessons = 0;

        enrollment.course.modules.forEach(mod => {
            mod.lessons.forEach(lesson => {
                courseLessons++;
                if (lesson.userProgress.length > 0) {
                    completedLessons++;
                    courseCompletedLessons++;
                }
                
                // Check Quiz Scores
                lesson.quizzes.forEach(quiz => {
                    const bestScore = Math.max(...quiz.attempts.map(a => a.score), 0);
                    // Assuming roughly 100% if score == totalQuestions, but we don't have totalQuestions handy in simple view 
                    // Let's rely on percentage calculation if we had it, or just generic "has an attempt" for now.
                    // Actually, let's check attempts. If score > 0 it counts. 
                    // Better logic: Find attempts with high score.
                    // Since we didn't fetch totalQuestions easily here without deep nesting, we'll simplify:
                    // Any attempt > 80%? We can't know % without max score.
                    // Let's just count "Taken Quizzes" for now.
                    if (quiz.attempts.length > 0) perfectQuizzes++; 
                });
            });
        });

        if (courseLessons > 0 && courseLessons === courseCompletedLessons) {
            completedCourses++;
        }
    });

    // 3. Define Achievements Definitions & Check Logic
    const definitions = [
        {
            id: "first-step",
            title: "First Step",
            description: "Complete your first lesson.",
            icon: "fa-shoe-prints",
            color: "bg-blue-500",
            check: () => completedLessons >= 1,
            progress: () => Math.min((completedLessons / 1) * 100, 100)
        },
        {
            id: "quiz-taker",
            title: "Quiz Taker",
            description: "Complete 3 quizzes.",
            icon: "fa-pencil-alt",
            color: "bg-purple-500",
            check: () => perfectQuizzes >= 3,
            progress: () => Math.min((perfectQuizzes / 3) * 100, 100)
        },
        {
            id: "course-champ",
            title: "Course Champion",
            description: "Complete your first full course.",
            icon: "fa-trophy",
            color: "bg-amber-500",
            check: () => completedCourses >= 1,
            progress: () => Math.min((completedCourses / 1) * 100, 100)
        },
        {
            id: "dedicated",
            title: "Dedicated Learner",
            description: "Enroll in 3 courses.",
            icon: "fa-book-open",
            color: "bg-teal-500",
            check: () => totalEnrollments >= 3,
            progress: () => Math.min((totalEnrollments / 3) * 100, 100)
        },
        {
            id: "scholar",
            title: "Tech Scholar",
            description: "Complete 10 lessons.",
            icon: "fa-graduation-cap",
            color: "bg-indigo-600",
            check: () => completedLessons >= 10,
            progress: () => Math.min((completedLessons / 10) * 100, 100)
        }
    ];

    // 4. Map to Result
    const achievements: Achievement[] = definitions.map(def => {
        const isUnlocked = def.check();
        return {
            id: def.id,
            title: def.title,
            description: def.description,
            icon: def.icon,
            color: def.color,
            unlockedAt: isUnlocked ? new Date() : null, // We don't track exact date without a table, so just "now" if unlocked.
            progress: def.progress()
        };
    });

    return { success: true, data: achievements };

  } catch (error) {
    console.error("Error fetching achievements:", error);
    return { success: false, error: "Failed to load achievements" };
  }
}
