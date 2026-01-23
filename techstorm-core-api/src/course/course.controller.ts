import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('courses')
@UseGuards(AuthGuard('jwt'))
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  findAll(@Request() req) {
    return this.courseService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id/edit')
  findOneForEdit(@Param('id') id: string, @Request() req) {
    return this.courseService.findOneForEdit(id, req.user.userId);
  }

  @Post()
  create(@Request() req, @Body('title') title: string) {
    return this.courseService.create(req.user.userId, title);
  }

  @Post('generate-ai')
  generateWithAi(@Request() req, @Body() body: { topic: string; level: string }) {
    return this.courseService.generateWithAi(req.user.userId, body.topic, body.level);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.courseService.update(id, req.user.userId, data);
  }

  @Post(':id/toggle-status')
  toggleStatus(@Param('id') id: string, @Request() req) {
    return this.courseService.toggleStatus(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.courseService.remove(id, req.user.userId);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') courseId: string) {
    return this.courseService.getSubmissions(courseId);
  }

  @Post('submissions/:id/grade')
  gradeSubmission(@Param('id') submissionId: string, @Body() data: { grade: string, feedback: string }) {
    return this.courseService.gradeSubmission(submissionId, data);
  }

  @Get('mentor/students')
  getStudentsForMentor(@Request() req) {
    return this.courseService.getStudentsForMentor(req.user.userId);
  }
}
