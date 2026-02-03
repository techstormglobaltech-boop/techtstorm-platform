import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('setup-account')
  async setupAccount(@Body() body: { token: string; password: string; name?: string; image?: string; title?: string; bio?: string; linkedinUrl?: string; githubUrl?: string; twitterUrl?: string }) {
    const { token, password, name, ...profileData } = body;
    return this.authService.setupAccount(token, password, name, profileData);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Request() req, @Body() data: any) {
    return this.authService.updateProfile(req.user.userId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('password')
  updatePassword(@Request() req, @Body() data: any) {
    return this.authService.updatePassword(req.user.userId, data);
  }
}
