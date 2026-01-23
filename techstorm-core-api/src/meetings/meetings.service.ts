import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, role: string, data: any) {
    if (role !== 'MENTOR' && role !== 'ADMIN') throw new ForbiddenException();

    if (!data.isRecurring) {
      return this.prisma.meeting.create({
        data: {
          title: data.title,
          description: data.description,
          startTime: new Date(data.startTime),
          link: data.link,
          courseId: data.courseId,
          mentorId: userId,
        },
      });
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endDate);
    const selectedDays = data.daysOfWeek?.map(Number) || [];
    const meetingsToCreate = [];
    let current = new Date(start);

    while (current <= end) {
      if (selectedDays.includes(current.getDay())) {
        meetingsToCreate.push({
          title: data.title,
          description: data.description,
          startTime: new Date(current),
          link: data.link,
          courseId: data.courseId,
          mentorId: userId,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return this.prisma.meeting.createMany({ data: meetingsToCreate });
  }

  async findMentorMeetings(userId: string) {
    return this.prisma.meeting.findMany({
      where: { 
        mentorId: userId,
        startTime: { gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) }
      },
      include: { 
        course: { select: { title: true } },
        mentee: { select: { name: true, image: true, email: true } }
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findMenteeMeetings(userId: string) {
    return this.prisma.meeting.findMany({
      where: {
        OR: [
          { course: { enrollments: { some: { userId } } }, menteeId: null },
          { menteeId: userId }
        ],
        startTime: { gte: new Date(new Date().getTime() - 60 * 60 * 1000) }
      },
      include: {
        course: { select: { title: true } },
        mentor: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async requestSession(userId: string, data: any) {
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
      select: { instructorId: true }
    });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        courseId: data.courseId,
        mentorId: course.instructorId,
        menteeId: userId,
        status: 'REQUESTED',
        link: '',
      }
    });
  }

  async updateStatus(userId: string, meetingId: string, status: string, link?: string) {
    return this.prisma.meeting.update({
      where: { id: meetingId, mentorId: userId },
      data: { status: status as any, link }
    });
  }

  async remove(userId: string, role: string, id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (meeting.mentorId !== userId && role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.meeting.delete({ where: { id } });
  }
}
