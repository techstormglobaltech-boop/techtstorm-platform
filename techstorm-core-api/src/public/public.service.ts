import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getHomeData() {
    const [courses, events, totalMentees, totalCourses, totalMentors] = await Promise.all([
      this.prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: { select: { name: true } },
          _count: { select: { modules: true } },
        },
      }),
      this.prisma.event.findMany({
        where: { date: { gte: new Date() } },
        take: 3,
        orderBy: { date: 'asc' },
      }),
      this.prisma.user.count({ where: { role: 'MENTEE' } }),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.user.count({ where: { role: 'MENTOR' } }),
    ]);

    return {
      courses,
      events,
      stats: {
        totalMentees,
        totalCourses,
        totalMentors,
      },
    };
  }

  async getPublishedCourses() {
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        instructor: {
          select: { name: true },
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourseById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { name: true, image: true, email: true },
        },
        modules: {
          include: {
            lessons: true,
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async getMaintenanceMode() {
    const settings = await this.prisma.globalSetting.findUnique({
      where: { id: 'system_settings' },
    });
    return !!settings?.maintenanceMode;
  }

  async getTeamMembers() {
    return this.prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });
  }
}
