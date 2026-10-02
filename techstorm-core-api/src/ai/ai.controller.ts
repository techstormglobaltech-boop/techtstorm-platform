import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('code-review')
  async reviewCode(@Body() body: { code: string; assignmentDescription: string }) {
    return this.aiService.reviewCode(body.code, body.assignmentDescription);
  }
}
