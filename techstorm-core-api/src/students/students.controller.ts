import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('students')
@UseGuards(AuthGuard('jwt'))
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('courses/:id/content')
  getCourseContent(@Request() req, @Param('id') courseId: string) {
    return this.studentsService.getCourseContent(req.user.userId, courseId);
  }

  @Post('lessons/:id/complete')
  markComplete(@Request() req, @Param('id') lessonId: string, @Body('completed') completed: boolean) {
    return this.studentsService.markComplete(req.user.userId, lessonId, completed);
  }

  @Post('enroll')
  enroll(@Request() req, @Body('courseId') courseId: string) {
    return this.studentsService.enroll(req.user.userId, courseId);
  }

  @Delete('enroll/:courseId')
  unenroll(@Request() req, @Param('courseId') courseId: string) {
    return this.studentsService.unenroll(req.user.userId, courseId);
  }

  @Post('quizzes/:id/submit')
  submitQuiz(@Request() req, @Param('id') quizId: string, @Body() body: { score: number, totalQuestions: number }) {
    return this.studentsService.submitQuiz(req.user.userId, quizId, body.score, body.totalQuestions);
  }

  @Post('assignments/:id/submit')
  submitAssignment(@Request() req, @Param('id') assignmentId: string, @Body('content') content: string) {
    return this.studentsService.submitAssignment(req.user.userId, assignmentId, content);
  }

  @Get('achievements')
  getAchievements(@Request() req) {
    return this.studentsService.getAchievements(req.user.userId);
  }

  @Get('grades')
  getGrades(@Request() req) {
    return this.studentsService.getGrades(req.user.userId);
  }

  @Get('courses/:id/enrolled')
  checkEnrollment(@Request() req, @Param('id') courseId: string) {
    return this.studentsService.checkEnrollment(req.user.userId, courseId);
  }

  @Get('enrolled-courses')
  getEnrolledCourses(@Request() req) {
    return this.studentsService.getEnrolledCourses(req.user.userId);
  }

  @Get('my-courses')
  getMyCourses(@Request() req) {
    return this.studentsService.getMyCourses(req.user.userId);
  }

  @Get('dashboard')
  getMenteeDashboardData(@Request() req) {
    return this.studentsService.getMenteeDashboardData(req.user.userId);
  }
}
