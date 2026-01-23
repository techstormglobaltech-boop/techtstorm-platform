import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('platform')
  getPlatformReports(@Request() req) {
    return this.reportsService.getPlatformReports(req.user.role);
  }

  @Get('admin-dashboard')
  getAdminStats(@Request() req) {
    return this.reportsService.getAdminDashboardStats(req.user.role);
  }

  @Get('mentor-dashboard')
  getMentorStats(@Request() req) {
    return this.reportsService.getMentorStats(req.user.userId);
  }
}
