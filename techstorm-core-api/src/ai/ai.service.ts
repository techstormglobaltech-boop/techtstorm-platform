import { Injectable, InternalServerErrorException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiService.name);
  private readonly aiUrl: string;
  private keepAliveInterval: NodeJS.Timeout;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiUrl = this.configService.get<string>('AI_ENGINE_URL') || 'http://localhost:8000';
  }

  onModuleInit() {
    this.pingAiEngine(); // Initial wake-up
    
    // Schedule keep-alive ping every 14 minutes (Render sleeps after 15 mins)
    this.keepAliveInterval = setInterval(() => {
      this.pingAiEngine();
    }, 14 * 60 * 1000); 
  }

  onModuleDestroy() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
  }

  private pingAiEngine() {
    this.logger.log(`[Keep-Alive] Pinging AI Engine at ${this.aiUrl}...`);
    this.httpService.get(this.aiUrl, { timeout: 5000 }).subscribe({
      next: () => this.logger.debug('AI Engine is active.'),
      error: (err) => this.logger.warn(`AI Engine unreachable/sleeping. Wake-up signal sent. (${err.message})`)
    });
  }

  async generateCourseOutline(topic: string, level: string = 'Beginner') {
    try {
      const response = await firstValueFrom<any>(
        this.httpService.post(
          `${this.aiUrl}/api/v1/course/generate`, 
          { topic, level },
          { timeout: 60000 } // 60 seconds timeout
        )
      );
      return response.data;
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      throw new InternalServerErrorException('AI Engine failed to generate outline');
    }
  }

  async generateQuiz(topic: string, difficulty: string = 'Intermediate') {
    try {
      const response = await firstValueFrom<any>(
        this.httpService.post(`${this.aiUrl}/api/v1/quiz/generate`, { topic, difficulty })
      );
      return response.data;
    } catch (error) {
      console.error('AI Quiz Error:', error.message);
      throw new InternalServerErrorException('AI Engine failed to generate quiz');
    }
  }

  async generatePlatformInsights(stats: any) {
    try {
      const response = await firstValueFrom<any>(
        this.httpService.post(`${this.aiUrl}/api/v1/reports/generate-insights`, stats)
      );
      return response.data;
    } catch (error) {
      return {
        summary: 'AI insights are temporarily unavailable.',
        insights: ['Maintain student engagement.', 'Review quiz performance.'],
        recommendation: 'Try again later.'
      };
    }
  }

  async generateMentorInsights(stats: any) {
    try {
      const response = await firstValueFrom<any>(
        this.httpService.post(`${this.aiUrl}/api/v1/reports/generate-mentor-insights`, stats)
      );
      return response.data;
    } catch (error) {
      return {
        summary: 'Mentor insights are temporarily unavailable.',
        insights: ['Check student progress manually.', 'Focus on active modules.'],
        recommendation: 'Try again later.'
      };
    }
  }
}
