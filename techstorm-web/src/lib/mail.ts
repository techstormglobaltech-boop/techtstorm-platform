import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export const sendInvitationEmail = async (email: string, courseTitle: string, inviteLink: string) => {
  if (!resend) {
    console.warn("RESEND_API_KEY is missing. Email simulation: Invitation to", email);
    return { success: true }; // Simulate success in dev mode
  }

  try {
    await resend.emails.send({
      from: 'TechStorm Global <onboarding@resend.dev>', // You should update this to your verified domain later
      to: email,
      subject: `Invitation to join ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #007C85;">Welcome to TechStorm Global</h2>
          <p>You have been invited to enroll in the course: <strong>${courseTitle}</strong>.</p>
          <p>Click the button below to accept your invitation and start learning:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #007C85; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Accept Invitation</a>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { error: "Failed to send email" };
  }
};
