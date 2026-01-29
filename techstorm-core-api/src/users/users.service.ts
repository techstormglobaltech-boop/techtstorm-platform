import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        title: true,
        bio: true,
        linkedinUrl: true,
        githubUrl: true,
        twitterUrl: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image,
        title: data.title,
        bio: data.bio,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        twitterUrl: data.twitterUrl,
      },
    });
  }

  async getMentors() {
    return this.prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        image: true,
        title: true,
        bio: true,
        linkedinUrl: true,
        githubUrl: true,
        twitterUrl: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
