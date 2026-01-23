import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is missing. Emails will be simulated.');
    }
  }

  async sendInvitationEmail(email: string, courseTitle: string, inviteLink: string) {
    if (!this.resend) {
      this.logger.log(`Simulation: Sending invitation to ${email} for ${courseTitle}`);
      return { success: true };
    }

    try {
      await this.resend.emails.send({
        from: 'TechStorm Global <onboarding@resend.dev>',
        to: email,
        subject: `Invitation to join ${courseTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #007C85;">Welcome to TechStorm Global</h2>
            <p>You have been invited to enroll in the course: <strong>${courseTitle}</strong>.</p>
            <p>Click the button below to accept your invitation and start learning:</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #007C85; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Accept Invitation</a>
            <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error.stack);
      return { error: 'Failed to send email' };
    }
  }
}
