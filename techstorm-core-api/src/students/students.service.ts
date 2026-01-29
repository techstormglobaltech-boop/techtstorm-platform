import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async getCourseContent(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              include: {
                userProgress: { where: { userId } },
                quizzes: {
                  include: {
                    questions: { include: { options: true } }
                  }
                },
                assignments: {
                  include: {
                    submissions: { where: { userId } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!course) return null;

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

  async markComplete(userId: string, lessonId: string, completed: boolean) {
    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: { isCompleted: completed },
      create: { userId, lessonId, isCompleted: completed }
    });
  }

  async enroll(userId: string, courseId: string) {
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingEnrollment) {
      return existingEnrollment;
    }

    return this.prisma.enrollment.create({
      data: { userId, courseId },
    });
  }

  async unenroll(userId: string, courseId: string) {
    return this.prisma.enrollment.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async submitQuiz(userId: string, quizId: string, score: number, totalQuestions: number) {
    return this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalQuestions,
      },
    });
  }

  async submitAssignment(userId: string, assignmentId: string, content: string) {
    // We try to find an existing submission to update it, or create a new one.
    // Since we don't have a unique constraint on userId_assignmentId in the provided schema, 
    // we'll look for the first one or just create a new one. 
    // Best practice is to have a unique constraint.
    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { userId, assignmentId, status: 'PENDING' }
    });

    if (existing) {
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: { content, submittedAt: new Date() }
      });
    }

    return this.prisma.assignmentSubmission.create({
      data: { userId, assignmentId, content }
    });
  }

  async getAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
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
                            attempts: { where: { userId } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    let completedLessons = 0;
    let perfectQuizzes = 0;
    let completedCourses = 0;
    let totalEnrollments = user.enrollments.length;

    user.enrollments.forEach((enrollment) => {
      let courseLessons = 0;
      let courseCompletedLessons = 0;

      enrollment.course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          courseLessons++;
          if (lesson.userProgress.length > 0) {
            completedLessons++;
            courseCompletedLessons++;
          }

          lesson.quizzes.forEach((quiz) => {
            if (quiz.attempts.length > 0) perfectQuizzes++;
          });
        });
      });

      if (courseLessons > 0 && courseLessons === courseCompletedLessons) {
        completedCourses++;
      }
    });

    const definitions = [
      {
        id: 'first-step',
        title: 'First Step',
        description: 'Complete your first lesson.',
        icon: 'fa-shoe-prints',
        color: 'bg-blue-500',
        check: () => completedLessons >= 1,
        progress: () => Math.min((completedLessons / 1) * 100, 100),
      },
      {
        id: 'quiz-taker',
        title: 'Quiz Taker',
        description: 'Complete 3 quizzes.',
        icon: 'fa-pencil-alt',
        color: 'bg-purple-500',
        check: () => perfectQuizzes >= 3,
        progress: () => Math.min((perfectQuizzes / 3) * 100, 100),
      },
      {
        id: 'course-champ',
        title: 'Course Champion',
        description: 'Complete your first full course.',
        icon: 'fa-trophy',
        color: 'bg-amber-500',
        check: () => completedCourses >= 1,
        progress: () => Math.min((completedCourses / 1) * 100, 100),
      },
      {
        id: 'dedicated',
        title: 'Dedicated Learner',
        description: 'Enroll in 3 courses.',
        icon: 'fa-book-open',
        color: 'bg-teal-500',
        check: () => totalEnrollments >= 3,
        progress: () => Math.min((totalEnrollments / 3) * 100, 100),
      },
      {
        id: 'scholar',
        title: 'Tech Scholar',
        description: 'Complete 10 lessons.',
        icon: 'fa-graduation-cap',
        color: 'bg-indigo-600',
        check: () => completedLessons >= 10,
        progress: () => Math.min((completedLessons / 10) * 100, 100),
      },
    ];

    return definitions.map((def) => {
      const isUnlocked = def.check();
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        color: def.color,
        unlockedAt: isUnlocked ? new Date() : null,
        progress: def.progress(),
      };
    });
  }

  async getGrades(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
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
                          orderBy: { score: 'desc' },
                          take: 1,
                        },
                      },
                    },
                    assignments: {
                      include: {
                        submissions: {
                          where: { userId },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map((enrollment) => {
      const course = enrollment.course;
      const quizzes: any[] = [];
      const assignments: any[] = [];

      course.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          lesson.quizzes.forEach((quiz) => {
            const attempt = quiz.attempts[0];
            quizzes.push({
              id: quiz.id,
              title: quiz.title,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              score: attempt ? attempt.score : null,
              totalQuestions: attempt ? attempt.totalQuestions : null,
              percentage: attempt
                ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                : null,
              status: attempt ? 'Completed' : 'Not Started',
              date: attempt ? attempt.completedAt : null,
            });
          });

          lesson.assignments.forEach((assign) => {
            const submission = assign.submissions[0];
            assignments.push({
              id: assign.id,
              title: assign.title,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              status: submission ? submission.status : 'Not Submitted',
              grade: submission?.grade || null,
              feedback: submission?.feedback || null,
              submittedAt: submission?.submittedAt || null,
            });
          });
        });
      });

      const completedQuizzes = quizzes.filter((q) => q.status === 'Completed');
      const avgQuizScore =
        completedQuizzes.length > 0
          ? Math.round(
              completedQuizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) /
                completedQuizzes.length,
            )
          : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        courseImage: course.image,
        stats: {
          avgQuizScore,
          quizzesCompleted: completedQuizzes.length,
          totalQuizzes: quizzes.length,
          assignmentsSubmitted: assignments.filter(
            (a) => a.status !== 'Not Submitted',
          ).length,
          totalAssignments: assignments.length,
        },
        quizzes,
        assignments,
      };
    });
  }

  async checkEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
    return !!enrollment;
  }

  async getEnrolledCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async getMyCourses(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: {
              include: {
                lessons: {
                  include: {
                    userProgress: { where: { userId } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map((e) => {
      const course = e.course;
      let totalLessons = 0;
      let completedLessons = 0;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          totalLessons++;
          if (lesson.userProgress.length > 0 && lesson.userProgress[0].isCompleted) {
            completedLessons++;
          }
        });
      });

      const progress =
        totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

      return {
        id: course.id,
        title: course.title,
        image: course.image,
        instructor: course.instructor,
        progress,
        totalLessons,
        completedLessons,
      };
    });
  }

  async getMenteeDashboardData(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    userProgress: { where: { userId } },
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalLessons = 0;
    let completedLessons = 0;

    const courses = enrollments.map((e) => {
      const course = e.course;
      let courseTotal = 0;
      let courseCompleted = 0;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          courseTotal++;
          totalLessons++;
          if (lesson.userProgress.length > 0 && lesson.userProgress[0].isCompleted) {
            courseCompleted++;
            completedLessons++;
          }
        });
      });

      const progress =
        courseTotal === 0 ? 0 : Math.round((courseCompleted / courseTotal) * 100);

      return {
        id: course.id,
        title: course.title,
        progress,
      };
    });

    return {
      totalCourses: enrollments.length,
      totalLessons,
      completedLessons,
      overallProgress:
        totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
      courses,
    };
  }
}
