import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('invite')
  invite(@Body() body: { courseId: string; email: string }) {
    return this.invitationsService.inviteStudent(body.courseId, body.email);
  }

  @Post('accept')
  accept(@Request() req, @Body('token') token: string) {
    return this.invitationsService.acceptInvitation(req.user.userId, token);
  }
}
