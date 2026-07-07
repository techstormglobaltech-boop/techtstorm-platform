import { Controller, Get, Post } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Get()
  getAll() {
    return this.newslettersService.getAll();
  }

  @Get('latest')
  getLatest() {
    return this.newslettersService.getLatest();
  }

  // Manual trigger endpoint for testing
  @Post('trigger')
  triggerGeneration() {
    return this.newslettersService.generateNewsletterNow();
  }
}
