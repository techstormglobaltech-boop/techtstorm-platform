import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({ orderBy: { date: 'asc' } });
  }

  async findUpcoming() {
    return this.prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' }
    });
  }

  async create(data: any, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.event.create({
      data: { ...data, date: new Date(data.date) }
    });
  }

  async update(id: string, data: any, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.event.update({
      where: { id },
      data: { ...data, date: new Date(data.date) }
    });
  }

  async remove(id: string, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.event.delete({ where: { id } });
  }
}
