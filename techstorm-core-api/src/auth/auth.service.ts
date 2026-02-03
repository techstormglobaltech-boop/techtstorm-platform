import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const isAdmin = dto.email === 'admin@techstorm.com';

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        // Auto-verify admin@techstorm.com bypass, others must verify
        emailVerified: isAdmin ? new Date() : null,
        // Public registration ONLY allows MENTEE role
        role: 'MENTEE', 
      },
    });

    if (isAdmin) {
       // Send Welcome Email immediately for the special Admin bypass account
       await this.mailService.sendWelcomeEmail(user.email, user.name || 'Student');
       return { 
         message: 'Registration successful. You can log in now.',
         email: user.email 
       };
    }

    // Generate Verification Token for normal users
    const payload = { email: user.email, sub: user.id };
    const verificationToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    
    const frontendUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/auth/verify?token=${verificationToken}`;

    // Send Verification Email
    await this.mailService.sendVerificationEmail(user.email, verificationLink);

    // Return message indicating email sent
    return { 
      message: 'Registration successful. Please check your email to verify your account.',
      email: user.email 
    };
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) throw new UnauthorizedException('Invalid token');
      if (user.emailVerified) return { message: 'Email already verified' };

      // Update user status
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });

      // Send Welcome Email
      await this.mailService.sendWelcomeEmail(updatedUser.email, updatedUser.name || 'Student');

      // Auto-login: Return Auth Token
      const authPayload = { sub: updatedUser.id, email: updatedUser.email, role: updatedUser.role };
      return {
        access_token: this.jwtService.sign(authPayload),
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          image: updatedUser.image
        }
      };

    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async setupAccount(token: string, password: string, name?: string, profileData?: any) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'staff_invite') throw new BadRequestException('Invalid invitation token');

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('User not found');

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          emailVerified: new Date(),
          ...(name && { name }),
          // Profile Enrichment
          ...(profileData?.image && { image: profileData.image }),
          ...(profileData?.title && { title: profileData.title }),
          ...(profileData?.bio && { bio: profileData.bio }),
          ...(profileData?.linkedinUrl && { linkedinUrl: profileData.linkedinUrl }),
          ...(profileData?.githubUrl && { githubUrl: profileData.githubUrl }),
          ...(profileData?.twitterUrl && { twitterUrl: profileData.twitterUrl }),
        },
      });

      // Auto-login
      const authPayload = { sub: updatedUser.id, email: updatedUser.email, role: updatedUser.role };
      return {
        access_token: this.jwtService.sign(authPayload),
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          image: updatedUser.image
        }
      };

    } catch (error) {
      throw new BadRequestException('Invalid or expired invitation token');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);


    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image
      }
    };
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        ...(data.image && { image: data.image })
      }
    });
  }

  async updatePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(data.current, user.password);
    if (!match) throw new UnauthorizedException('Incorrect current password');

    const hashedPassword = await bcrypt.hash(data.new, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account with that email exists, we have sent a password reset link.' };
    }

    const payload = { sub: user.id, email: user.email, type: 'password_reset' };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    
    const frontendUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetLink);
    
    return { message: 'If an account with that email exists, we have sent a password reset link.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'password_reset') throw new BadRequestException('Invalid token type');

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('User not found');

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }
}
