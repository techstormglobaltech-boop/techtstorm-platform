import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NewslettersService {
  private readonly logger = new Logger(NewslettersService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async getAll() {
    return this.prisma.newsletter.findMany({
      orderBy: { generatedAt: 'desc' },
      where: { isPublished: true },
    });
  }

  async getLatest() {
    return this.prisma.newsletter.findFirst({
      orderBy: { generatedAt: 'desc' },
      where: { isPublished: true },
    });
  }

  // Cron job that runs every Monday at 8 AM
  @Cron('0 8 * * 1')
  async handleWeeklyNewsletterCron() {
    this.logger.log('CRON: Generating weekly newsletter via AI...');
    try {
      await this.generateNewsletterNow();
      this.logger.log('CRON: Newsletter generated successfully.');
    } catch (error) {
      this.logger.error('CRON: Failed to generate newsletter', error);
    }
  }

  async generateNewsletterNow() {
    const aiData = await this.aiService.generateNewsletter();
    
    // Fallback title logic if AI didn't return a JSON with a title
    const content = typeof aiData === 'string' ? aiData : aiData.content;
    const title = aiData.title || `TechStorm Weekly Digest - ${new Date().toLocaleDateString()}`;

    return this.prisma.newsletter.create({
      data: {
        title,
        content,
      }
    });
  }
}
