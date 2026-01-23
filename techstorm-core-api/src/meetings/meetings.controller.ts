import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.meetingsService.create(req.user.userId, req.user.role, data);
  }

  @Get('mentor')
  findMentorMeetings(@Request() req) {
    return this.meetingsService.findMentorMeetings(req.user.userId);
  }

  @Get('mentee')
  findMenteeMeetings(@Request() req) {
    return this.meetingsService.findMenteeMeetings(req.user.userId);
  }

  @Post('request')
  requestSession(@Request() req, @Body() data: any) {
    return this.meetingsService.requestSession(req.user.userId, data);
  }

  @Patch(':id/approve')
  approveSession(@Request() req, @Param('id') id: string, @Body('link') link: string) {
    return this.meetingsService.updateStatus(req.user.userId, id, 'SCHEDULED', link);
  }

  @Patch(':id/reject')
  rejectSession(@Request() req, @Param('id') id: string) {
    return this.meetingsService.updateStatus(req.user.userId, id, 'CANCELLED');
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.meetingsService.remove(req.user.userId, req.user.role, id);
  }
}
