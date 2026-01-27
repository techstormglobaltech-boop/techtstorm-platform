import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(adminRole: string, data: any) {
    if (adminRole !== 'ADMIN') throw new ForbiddenException();

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    // Create a random dummy password that no one knows
    const dummyPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        emailVerified: null, // Force them to verify/setup
      }
    });

    // Generate Invitation Token
    const payload = { sub: user.id, email: user.email, role: user.role, type: 'staff_invite' };
    const token = this.jwtService.sign(payload, { expiresIn: '48h' });

    const frontendUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const setupLink = `${frontendUrl}/auth/setup-account?token=${token}`;

    // Send Email in background (non-blocking)
    this.mailService.sendStaffInvitationEmail(user.email, user.role, setupLink)
      .catch(err => console.error(`Background Email Error (${user.email}):`, err));

    return { message: `Invitation sent to ${user.email}` };
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
