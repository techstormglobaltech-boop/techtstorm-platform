"use server";

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function submitContactForm(formData: { name: string; email: string; message: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY is missing. Simulating contact form submission:", formData);
    return { success: true, message: "Message simulated successfully (Development Mode)" };
  }

  try {
    const { name, email, message } = formData;

    await resend.emails.send({
      from: 'TechStorm Global <noreply@techstormglobal.com>', // Update to onboarding@resend.dev if domain not verified yet
      to: 'millsclifford10@gmail.com',
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #007C85; border-bottom: 2px solid #007C85; padding-bottom: 10px;">New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <h3 style="margin-top: 20px; color: #333;">Message:</h3>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; color: #475569; white-space: pre-wrap;">
            ${message}
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            This message was sent from the TechStorm Global Contact Form. You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      `
    });

    return { success: true, message: "Message sent successfully!" };
  } catch (error: any) {
    console.error("Contact form email error:", error);
    return { error: error.message || "Failed to send message. Please try again later." };
  }
}
