import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('home')
  getHomeData() {
    return this.publicService.getHomeData();
  }

  @Get('courses')
  getPublishedCourses() {
    return this.publicService.getPublishedCourses();
  }

  @Get('courses/:id')
  getCourseById(@Param('id') id: string) {
    return this.publicService.getCourseById(id);
  }

  @Get('maintenance')
  getMaintenanceMode() {
    return this.publicService.getMaintenanceMode();
  }
}
