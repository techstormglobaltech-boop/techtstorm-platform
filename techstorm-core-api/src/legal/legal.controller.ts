import { Controller, Get, Param, Patch, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { LegalService } from './legal.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get(':type')
  getDocument(@Param('type') type: string) {
    return this.legalService.getDocument(type);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':type')
  updateDocument(@Param('type') type: string, @Body() data: { title: string; content: string }, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Admin only');
    }
    return this.legalService.updateDocument(type, data);
  }
}
