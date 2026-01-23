import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  // MODULES
  async createModule(userId: string, courseId: string, title: string) {
    await this.validateOwnership(userId, courseId);
    
    const lastModule = await this.prisma.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' }
    });

    return this.prisma.module.create({
      data: {
        title,
        courseId,
        position: lastModule ? lastModule.position + 1 : 0
      }
    });
  }

  async deleteModule(userId: string, moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });
    if (module.course.instructorId !== userId) throw new UnauthorizedException();
    
    return this.prisma.module.delete({ where: { id: moduleId } });
  }

  // LESSONS
  async createLesson(userId: string, moduleId: string, title: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true }
    });
    if (module.course.instructorId !== userId) throw new UnauthorizedException();

    const lastLesson = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' }
    });

    return this.prisma.lesson.create({
      data: {
        title,
        moduleId,
        position: lastLesson ? lastLesson.position + 1 : 0,
        isFree: false
      }
    });
  }

  async updateLesson(userId: string, lessonId: string, data: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });
    if (lesson.module.course.instructorId !== userId) throw new UnauthorizedException();

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        isFree: data.isFree,
        duration: data.duration ? parseInt(data.duration) : null
      }
    });
  }

  async deleteLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });
    if (lesson.module.course.instructorId !== userId) throw new UnauthorizedException();

    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  // QUIZZES
  async saveQuiz(userId: string, lessonId: string, data: { title: string, id?: string }) {
    await this.validateLessonOwnership(userId, lessonId);

    return this.prisma.quiz.upsert({
      where: { id: data.id || 'new' },
      update: { title: data.title },
      create: { title: data.title, lessonId }
    });
  }

  async generateAiQuiz(userId: string, lessonId: string) {
    await this.validateLessonOwnership(userId, lessonId);
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    
    const aiQuiz = await this.aiService.generateQuiz(lesson.title);

    return this.prisma.$transaction(async (tx) => {
      const existingQuiz = await tx.quiz.findFirst({ where: { lessonId } });
      const quiz = existingQuiz 
        ? await tx.quiz.update({ where: { id: existingQuiz.id }, data: { title: aiQuiz.title } })
        : await tx.quiz.create({ data: { title: aiQuiz.title, lessonId } });

      await tx.question.createMany({
        data: aiQuiz.questions.map((q: any) => ({
          quizId: quiz.id,
          text: q.text,
          correctAnswer: q.correct_answer
        }))
      });

      const savedQuestions = await tx.question.findMany({
        where: { quizId: quiz.id },
        orderBy: { id: 'desc' },
        take: aiQuiz.questions.length
      });

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
      return quiz;
    });
  }

  // QUESTIONS
  async addQuestion(userId: string, quizId: string, data: any) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { include: { module: { include: { course: true } } } } }
    });
    if (quiz.lesson.module.course.instructorId !== userId) throw new UnauthorizedException();

    return this.prisma.question.create({
      data: {
        quizId,
        text: data.text,
        correctAnswer: data.correctAnswer,
        options: {
          create: data.options.map((opt: string) => ({ text: opt }))
        }
      }
    });
  }

  async deleteQuestion(userId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } } }
    });
    if (question.quiz.lesson.module.course.instructorId !== userId) throw new UnauthorizedException();

    return this.prisma.question.delete({ where: { id: questionId } });
  }

  // ASSIGNMENTS
  async saveAssignment(userId: string, lessonId: string, data: { title: string, description: string, id?: string }) {
    await this.validateLessonOwnership(userId, lessonId);

    return this.prisma.assignment.upsert({
      where: { id: data.id || 'new' },
      update: { title: data.title, description: data.description },
      create: { title: data.title, description: data.description, lessonId }
    });
  }

  // Helpers
  private async validateOwnership(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== userId) throw new UnauthorizedException();
  }

  private async validateLessonOwnership(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
    });
    if (!lesson || lesson.module.course.instructorId !== userId) throw new UnauthorizedException();
  }
}
