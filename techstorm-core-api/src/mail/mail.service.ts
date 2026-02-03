import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'TechStorm <info@techstormglobal.com>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log(`MailService initialized with API Key: ${apiKey.substring(0, 5)}...`);
      this.logger.log(`MailService From Address: ${this.fromEmail}`);
    } else {
      this.logger.warn('RESEND_API_KEY is missing. Emails will be simulated.');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`Simulation: Sending "${subject}" to ${to}`);
      return { success: true };
    }

    try {
      this.logger.log(`Attempting to send email to ${to} from ${this.fromEmail}`);
      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully. ID: ${data.data?.id}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      if (error.response) {
         this.logger.error('Resend API Error Response:', JSON.stringify(error.response.data));
      }
      return { error: 'Failed to send email' };
    }
  }

  async sendInvitationEmail(email: string, courseTitle: string, inviteLink: string) {
    const subject = `Invitation to join ${courseTitle}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #008080;">Welcome to TechStorm Global</h2>
        <p>You have been invited to enroll in the course: <strong>${courseTitle}</strong>.</p>
        <p>Click the button below to accept your invitation and start learning:</p>
        <a href="${inviteLink}" style="display: inline-block; background-color: #008080; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Accept Invitation</a>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `;
    return this.send(email, subject, html);
  }

  async sendWelcomeEmail(email: string, name: string) {
    const subject = 'Welcome to TechStorm Global!';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #008080;">Hi ${name},</h2>
        <p>We're thrilled to have you on board! TechStorm Global is your gateway to mastering AI and technology.</p>
        <p>Explore our courses or connect with a mentor to get started.</p>
      </div>
    `;
    return this.send(email, subject, html);
  }

  async sendVerificationEmail(email: string, verificationLink: string) {
    const subject = 'Verify your TechStorm Global account';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #008080;">Verify your email</h2>
        <p>Thanks for signing up for TechStorm Global! Please verify your email address to get started.</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #008080; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Verify Email</a>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;
    return this.send(email, subject, html);
  }

  async sendStaffInvitationEmail(email: string, role: string, setupLink: string) {
    const subject = `Invitation to join TechStorm Global as ${role}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #008080;">Join the Team</h2>
        <p>You have been invited to join TechStorm Global as a <strong>${role}</strong>.</p>
        <p>Please click the button below to set up your account and password:</p>
        <a href="${setupLink}" style="display: inline-block; background-color: #008080; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Accept Invitation</a>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">This link will expire in 48 hours.</p>
      </div>
    `;
    return this.send(email, subject, html);
  }

  async sendMeetingScheduledEmail(email: string, meetingTitle: string, date: Date, link?: string) {
    const subject = `Meeting Scheduled: ${meetingTitle}`;
    const dateString = new Date(date).toLocaleString();
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #008080;">Meeting Confirmed</h2>
        <p>Your meeting <strong>${meetingTitle}</strong> has been scheduled.</p>
        <p><strong>Time:</strong> ${dateString}</p>
        ${link ? `<p><strong>Link:</strong> <a href="${link}">${link}</a></p>` : ''}
      </div>
    `;
    return this.send(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const subject = 'Reset your TechStorm Global password';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #008080;">Reset Password Request</h2>
        <p>We received a request to reset your password for your TechStorm Global account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #008080; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Reset Password</a>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't request a password reset, you can safely ignore this email. The link will expire in 1 hour.</p>
      </div>
    `;
    return this.send(email, subject, html);
  }
}
