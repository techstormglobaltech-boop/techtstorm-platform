import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(@Request() req, @Query('role') role?: string) {
    return this.adminService.getUsers(req.user.role, role);
  }

  @Post('users')
  createUser(@Request() req, @Body() data: any) {
    return this.adminService.createUser(req.user.role, data);
  }

  @Patch('users/:id')
  updateUser(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(req.user.role, id, data);
  }

  @Delete('users/:id')
  deleteUser(@Request() req, @Param('id') id: string) {
    return this.adminService.deleteUser(req.user.role, id);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Post('settings')
  updateSettings(@Request() req, @Body() data: any) {
    return this.adminService.updateSettings(req.user.role, data);
  }
}
