import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async verifyCourseAccess(userId: string, courseId: string) {
    const [course, user] = await Promise.all([
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (user?.role === 'ADMIN' || course.instructorId === userId) {
      return true;
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment || enrollment.status !== 'APPROVED') {
      throw new UnauthorizedException(
        enrollment?.status === 'PENDING'
          ? 'Your enrollment is pending instructor approval.'
          : 'You do not have active access to this course.',
      );
    }

    return true;
  }

  async getCourseContent(userId: string, courseId: string, userRole?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
              include: {
                attachments: true,
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

    // Only allow viewing published courses, unless user is ADMIN or the instructor
    const isPrivileged = userRole === 'ADMIN' || course.instructorId === userId;
    if (course.status !== 'PUBLISHED' && !isPrivileged) {
      return null;
    }

    if (!isPrivileged) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId },
        },
      });

      if (!enrollment || enrollment.status !== 'APPROVED') {
        throw new UnauthorizedException(
          enrollment?.status === 'PENDING'
            ? 'Your enrollment is pending instructor approval.'
            : 'You are not enrolled in this course.'
        );
      }
    }

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
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    await this.verifyCourseAccess(userId, lesson.module.courseId);

    return (this.prisma.lessonProgress as any).upsert({
      where: {
        userId_lessonId: { userId, lessonId }
      },
      update: { isCompleted: completed, updatedAt: new Date() },
      create: { userId, lessonId, isCompleted: completed, updatedAt: new Date() }
    });
  }

  async enroll(userId: string, courseId: string, paymentReference?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!course || course.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot enroll in an unpublished course.');
    }

    const isPaid = typeof course.price === 'number' && course.price > 0;
    const cleanPaymentRef = paymentReference?.trim() || null;

    if (isPaid && !cleanPaymentRef) {
      throw new BadRequestException(
        'Please provide a valid Payment or Mobile Money Reference ID to request access to this paid course.',
      );
    }

    const requiredStatus = isPaid ? 'PENDING' : 'APPROVED';

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'REJECTED' || (existingEnrollment.status === 'PENDING' && cleanPaymentRef)) {
        const updated = await this.prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: requiredStatus,
            paymentReference: cleanPaymentRef || existingEnrollment.paymentReference,
            enrolledAt: new Date(),
          },
        });

        if (requiredStatus === 'PENDING' && course.instructor?.email) {
          const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
          this.mailService.sendEnrollmentRequestEmail(
            course.instructor.email,
            course.instructor.name || 'Instructor',
            student?.name || student?.email || 'A student',
            course.title,
            cleanPaymentRef || undefined,
          ).catch(() => {});
        }

        return updated;
      }
      return { ...existingEnrollment, alreadyEnrolled: existingEnrollment.status === 'APPROVED' };
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: requiredStatus,
        paymentReference: cleanPaymentRef,
      },
    });

    if (requiredStatus === 'PENDING' && course.instructor?.email) {
      const student = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      this.mailService.sendEnrollmentRequestEmail(
        course.instructor.email,
        course.instructor.name || 'Instructor',
        student?.name || student?.email || 'A student',
        course.title,
        cleanPaymentRef || undefined,
      ).catch(() => {});
    }

    return enrollment;
  }

  async unenroll(userId: string, courseId: string) {
    return this.prisma.enrollment.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  }

  async submitQuiz(userId: string, quizId: string, score: number, totalQuestions: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { lesson: { select: { module: { select: { courseId: true } } } } },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    await this.verifyCourseAccess(userId, quiz.lesson.module.courseId);

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
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { lesson: { select: { module: { select: { courseId: true } } } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    await this.verifyCourseAccess(userId, assignment.lesson.module.courseId);

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
          where: { status: 'APPROVED' },
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
    const totalEnrollments = user.enrollments.length;

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
      where: { 
        userId,
        status: 'APPROVED',
        course: { status: 'PUBLISHED' },
      },
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
    if (!enrollment) {
      return { isEnrolled: false, status: null };
    }
    return {
      isEnrolled: enrollment.status === 'APPROVED',
      status: enrollment.status,
      paymentReference: enrollment.paymentReference,
    };
  }

  async getEnrolledCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { 
        userId,
        status: 'APPROVED',
        course: { status: 'PUBLISHED' },
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async getMyCourses(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { 
        userId,
        course: { status: 'PUBLISHED' },
      },
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
      orderBy: { enrolledAt: 'desc' },
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
        status: e.status,
        enrolledAt: e.enrolledAt,
        paymentReference: e.paymentReference,
      };
    });
  }

  async getMenteeDashboardData(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    const allEnrollments = await this.prisma.enrollment.findMany({
      where: { 
        userId,
        course: { status: 'PUBLISHED' },
      },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: {
              orderBy: { position: 'asc' },
              include: {
                lessons: {
                  orderBy: { position: 'asc' },
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

    const approvedEnrollments = allEnrollments.filter((e) => e.status === 'APPROVED');
    const pendingEnrollmentsCount = allEnrollments.filter((e) => e.status === 'PENDING').length;

    let totalLessons = 0;
    let completedLessons = 0;
    let jumpBackCourse = null;

    const courses = approvedEnrollments.map((e) => {
      const course = e.course;
      let courseTotal = 0;
      let courseCompleted = 0;
      let nextLessonTitle = "Start Course";
      let foundNext = false;

      course.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          courseTotal++;
          totalLessons++;
          const isCompleted = lesson.userProgress.length > 0 && lesson.userProgress[0].isCompleted;
          if (isCompleted) {
            courseCompleted++;
            completedLessons++;
          } else if (!foundNext) {
             nextLessonTitle = lesson.title;
             foundNext = true;
          }
        });
      });

      const progress = courseTotal === 0 ? 0 : Math.round((courseCompleted / courseTotal) * 100);

      const courseData = {
        id: course.id,
        title: course.title,
        image: course.image,
        progress,
        totalLessons: courseTotal,
        completedLessons: courseCompleted,
        nextLessonTitle,
      };

      if (!jumpBackCourse && progress < 100 && progress > 0) {
        jumpBackCourse = courseData;
      }

      return courseData;
    });

    if (!jumpBackCourse && courses.length > 0) {
      jumpBackCourse = courses.find(c => c.progress < 100) || courses[0];
    }

    const excludedCourseIds = allEnrollments
      .filter((e) => e.status === 'APPROVED' || e.status === 'PENDING')
      .map((e) => e.courseId);

    const recommendations = await this.prisma.course.findMany({
      where: {
        id: { notIn: excludedCourseIds },
        status: 'PUBLISHED',
      },
      take: 4,
      include: { instructor: { select: { name: true } } },
    });

    const [progressRecords, quizAttempts, submissions] = await Promise.all([
      (this.prisma.lessonProgress as any).findMany({
        where: { userId, isCompleted: true },
        select: { updatedAt: true, createdAt: true },
      }),
      this.prisma.quizAttempt.findMany({
        where: { userId },
        select: { completedAt: true },
      }),
      this.prisma.assignmentSubmission.findMany({
        where: { userId },
        select: { submittedAt: true, updatedAt: true },
      }),
    ]);

    const activityDates: Date[] = [];
    progressRecords.forEach((p: any) => {
      if (p.updatedAt) activityDates.push(p.updatedAt);
      else if (p.createdAt) activityDates.push(p.createdAt);
    });
    quizAttempts.forEach((q) => {
      if (q.completedAt) activityDates.push(q.completedAt);
    });
    submissions.forEach((s) => {
      if (s.submittedAt) activityDates.push(s.submittedAt);
      else if (s.updatedAt) activityDates.push(s.updatedAt);
    });

    const streak = this.calculateStreak(activityDates);

    return {
      user: { name: user?.name },
      totalCourses: approvedEnrollments.length,
      pendingEnrollmentsCount,
      totalCompletedLessons: completedLessons,
      overallProgress: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
      courses,
      jumpBackCourse,
      recommendations,
      streak,
    };
  }

  private calculateStreak(dates: Date[]): number {
    if (!dates || dates.length === 0) return 0;

    const activeDays = new Set<string>();
    for (const d of dates) {
      if (!d) continue;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) continue;
      const dayStr = dateObj.toISOString().split('T')[0];
      activeDays.add(dayStr);
    }

    if (activeDays.size === 0) return 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let checkDate: Date;
    let streak = 0;

    if (activeDays.has(todayStr)) {
      streak = 1;
      checkDate = yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (activeDays.has(checkStr)) {
          streak++;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
          break;
        }
      }
    } else if (activeDays.has(yesterdayStr)) {
      streak = 1;
      checkDate = new Date(yesterday);
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (activeDays.has(checkStr)) {
          streak++;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }

    return streak;
  }
}
