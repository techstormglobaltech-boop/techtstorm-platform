import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async inviteStudent(courseId: string, email: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.courseInvitation.create({
      data: {
        email,
        token,
        courseId,
        expiresAt,
      },
    });

    const webUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const inviteLink = `${webUrl}/invite/accept?token=${token}`;
    
    return this.mailService.sendInvitationEmail(email, course.title, inviteLink);
  }

  async acceptInvitation(userId: string, token: string) {
    const invitation = await this.prisma.courseInvitation.findUnique({
      where: { token },
      include: { course: true },
    });

    if (!invitation) throw new BadRequestException('Invalid invitation link.');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation has expired.');

    const enrollment = await this.prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: invitation.courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId: invitation.courseId,
      },
    });

    await this.prisma.courseInvitation.delete({ where: { id: invitation.id } });

    return { success: true, courseId: invitation.courseId };
  }
}
