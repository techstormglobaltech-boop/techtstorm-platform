import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly aiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiUrl = this.configService.get<string>('AI_ENGINE_URL') || 'http://localhost:8000';
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
