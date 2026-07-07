import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private prisma: PrismaService) {}

  async getDocument(type: string) {
    const doc = await this.prisma.legalDocument.findUnique({
      where: { type },
    });
    
    if (!doc) {
      // Return a default empty state if not found
      return {
        type,
        title: type === 'PRIVACY_POLICY' ? 'Privacy Policy' : 'Terms of Service',
        content: '# Document not found\n\nThis document has not been created yet.',
        updatedAt: new Date()
      };
    }
    
    return doc;
  }

  async updateDocument(type: string, data: { title: string; content: string }) {
    return this.prisma.legalDocument.upsert({
      where: { type },
      update: {
        title: data.title,
        content: data.content,
      },
      create: {
        type,
        title: data.title,
        content: data.content,
      },
    });
  }
}
