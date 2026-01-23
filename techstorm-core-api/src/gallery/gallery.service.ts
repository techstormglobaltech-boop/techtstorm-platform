import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.galleryImage.create({
      data: {
        url: data.url,
        title: data.title,
        category: data.category,
        description: data.description,
      },
    });
  }

  async remove(id: string, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.galleryImage.delete({ where: { id } });
  }
}
