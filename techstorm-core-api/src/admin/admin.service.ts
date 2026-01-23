import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createUser(adminRole: string, data: any) {
    if (adminRole !== 'ADMIN') throw new ForbiddenException();

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      }
    });
  }

  async getUsers(adminRole: string, roleFilter?: string) {
    if (adminRole !== 'ADMIN') throw new ForbiddenException();
    
    return this.prisma.user.findMany({
      where: roleFilter ? { role: roleFilter as any } : {},
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        status: true, 
        createdAt: true,
        _count: {
          select: {
            coursesTeaching: true,
            enrollments: true,
          }
        }
      }
    });
  }

  async updateUser(role: string, id: string, data: any) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(role: string, id: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.user.delete({ where: { id } });
  }

  async getSettings() {
    return this.prisma.globalSetting.findUnique({ where: { id: 'system_settings' } });
  }

  async updateSettings(role: string, data: any) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.globalSetting.upsert({
      where: { id: 'system_settings' },
      update: data,
      create: { id: 'system_settings', ...data }
    });
  }
}
