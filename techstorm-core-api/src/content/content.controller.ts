import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ContentService } from './content.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('content')
@UseGuards(AuthGuard('jwt'))
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // MODULES
  @Post('modules')
  createModule(@Request() req, @Body() body: { courseId: string; title: string }) {
    return this.contentService.createModule(req.user.userId, body.courseId, body.title);
  }

  @Delete('modules/:id')
  deleteModule(@Request() req, @Param('id') id: string) {
    return this.contentService.deleteModule(req.user.userId, id);
  }

  // LESSONS
  @Post('lessons')
  createLesson(@Request() req, @Body() body: { moduleId: string; title: string; courseId: string }) {
    return this.contentService.createLesson(req.user.userId, body.moduleId, body.title);
  }

  @Patch('lessons/:id')
  updateLesson(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.contentService.updateLesson(req.user.userId, id, body);
  }

  @Delete('lessons/:id')
  deleteLesson(@Request() req, @Param('id') id: string) {
    return this.contentService.deleteLesson(req.user.userId, id);
  }

  // QUIZZES
  @Post('quizzes')
  saveQuiz(@Request() req, @Body() body: { lessonId: string; data: any; courseId: string }) {
    return this.contentService.saveQuiz(req.user.userId, body.lessonId, body.data);
  }

  @Post('quizzes/generate-ai')
  generateAiQuiz(@Request() req, @Body() body: { lessonId: string; lessonTitle: string; courseId: string }) {
    return this.contentService.generateAiQuiz(req.user.userId, body.lessonId);
  }

  // QUESTIONS
  @Post('questions')
  addQuestion(@Request() req, @Body() body: { quizId: string; data: any; courseId: string }) {
    return this.contentService.addQuestion(req.user.userId, body.quizId, body.data);
  }

  @Delete('questions/:id')
  deleteQuestion(@Request() req, @Param('id') id: string) {
    return this.contentService.deleteQuestion(req.user.userId, id);
  }

  // ASSIGNMENTS
  @Post('assignments')
  saveAssignment(@Request() req, @Body() body: { lessonId: string; data: any; courseId: string }) {
    return this.contentService.saveAssignment(req.user.userId, body.lessonId, body.data);
  }
}
