import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async findAll(userId: string, role: string) {
    const isAdmin = role === 'ADMIN';
    return this.prisma.course.findMany({
      where: isAdmin ? {} : { instructorId: userId },
      orderBy: { createdAt: 'desc' },
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
  }

  async findOneForEdit(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
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
                assignments: true,
                attachments: true // Include attachments
              }
            }
          }
        }
      }
    });

    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== userId) throw new UnauthorizedException();

    return course;
  }

  async create(userId: string, title: string) {
    return this.prisma.course.create({
      data: {
        title,
        instructorId: userId,
        status: CourseStatus.DRAFT,
      }
    });
  }

  async generateWithAi(userId: string, topic: string, level: string) {
    const outline = await this.aiService.generateCourseOutline(topic, level);
    
    return this.prisma.$transaction(async (tx) => {
      return tx.course.create({
        data: {
          title: outline.title,
          description: outline.description,
          instructorId: userId,
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
                  type: lesson.type || 'VIDEO',
                  textContent: lesson.textContent || null,
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
    }, {
      maxWait: 10000, // Wait up to 10s for transaction to start
      timeout: 20000  // Allow transaction to run for 20s
    });
  }

  async update(id: string, userId: string, data: any, role?: string) {
    const whereClause = role === 'ADMIN' ? { id } : { id, instructorId: userId };
    return this.prisma.course.update({
      where: whereClause,
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
        ...(data.status && { status: data.status }),
      }
    });
  }

  async toggleStatus(id: string, userId: string, role?: string) {
    const whereClause = role === 'ADMIN' ? { id } : { id, instructorId: userId };
    const course = await this.prisma.course.findUnique({ where: whereClause });
    if (!course) throw new NotFoundException();

    const newStatus = course.status === CourseStatus.PUBLISHED ? CourseStatus.DRAFT : CourseStatus.PUBLISHED;
    return this.prisma.course.update({
      where: { id },
      data: { status: newStatus }
    });
  }

  async remove(id: string, userId: string, role?: string) {
    const whereClause = role === 'ADMIN' ? { id } : { id, instructorId: userId };
    return this.prisma.course.delete({ where: whereClause });
  }

  async getSubmissions(courseId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: {
        assignment: {
          lesson: {
            module: {
              courseId,
            },
          },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        assignment: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(submissionId: string, data: { grade: string; feedback: string }) {
    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade,
        feedback: data.feedback,
        status: 'GRADED',
      },
    });
  }

  async getStudentsForMentor(mentorId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: mentorId,
          status: 'PUBLISHED',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const studentMap = new Map();

    for (const enrollment of enrollments) {
      const studentId = enrollment.user.id;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          ...enrollment.user,
          enrolledCourses: [],
        });
      }

      const lessons = await this.prisma.lesson.findMany({
        where: { module: { courseId: enrollment.courseId } },
        include: {
          userProgress: {
            where: { userId: studentId },
          },
        },
      });

      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(
        (l) => l.userProgress?.[0]?.isCompleted,
      ).length;
      const progress =
        totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

      const quizAttempts = await this.prisma.quizAttempt.findMany({
        where: {
          userId: studentId,
          quiz: { lesson: { module: { courseId: enrollment.courseId } } },
        },
        include: { quiz: { select: { title: true } } },
      });

      const submissions = await this.prisma.assignmentSubmission.findMany({
        where: {
          userId: studentId,
          assignment: { lesson: { module: { courseId: enrollment.courseId } } },
        },
        include: { assignment: { select: { title: true } } },
      });

      studentMap.get(studentId).enrolledCourses.push({
        id: enrollment.course.id,
        title: enrollment.course.title,
        enrolledAt: enrollment.enrolledAt,
        enrollmentId: enrollment.id,
        status: enrollment.status,
        paymentReference: enrollment.paymentReference,
        progress,
        quizAttempts,
        submissions,
      });
    }

    return Array.from(studentMap.values());
  }

  async getPendingEnrollmentsForMentor(mentorId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: mentorId,
        },
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async updateEnrollmentStatus(
    userId: string,
    userRole: string,
    enrollmentId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const isPrivileged = userRole === 'ADMIN' || enrollment.course.instructorId === userId;
    if (!isPrivileged) {
      throw new UnauthorizedException('You do not have permission to manage this enrollment.');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
    });

    if (status === 'APPROVED' && enrollment.user?.email) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://techstormglobal.com';
      const courseLink = `${frontendUrl}/learn/${enrollment.courseId}`;
      this.mailService.sendEnrollmentApprovedEmail(
        enrollment.user.email,
        enrollment.course.title,
        courseLink,
      ).catch((err) => console.error('Failed to send approval email:', err));
    } else if (status === 'REJECTED' && enrollment.user?.email) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://techstormglobal.com';
      const coursePageLink = `${frontendUrl}/courses/${enrollment.courseId}`;
      this.mailService.sendEnrollmentRejectedEmail(
        enrollment.user.email,
        enrollment.course.title,
        coursePageLink,
      ).catch((err) => console.error('Failed to send rejection email:', err));
    }

    return updated;
  }
}
