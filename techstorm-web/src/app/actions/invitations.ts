"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sendInvitationEmail } from "@/lib/mail";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inviteStudent(courseId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // 1. Fetch course details
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { title: true }
  });

  if (!course) return { error: "Course not found" };

  // 2. Generate a secure unique token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    // 3. Save invitation to DB
    await db.courseInvitation.create({
      data: {
        email,
        token,
        courseId,
        expiresAt
      }
    });

    // 4. Send email via Resend
    const inviteLink = `${process.env.NEXTAUTH_URL}/invite/accept?token=${token}`;
    await sendInvitationEmail(email, course.title, inviteLink);

    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function acceptInvitation(token: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/invite/accept?token=${token}`);
  }

  // 1. Find invitation
  const invitation = await db.courseInvitation.findUnique({
    where: { token },
    include: { course: true }
  });

  if (!invitation) return { error: "Invalid invitation link." };
  if (invitation.expiresAt < new Date()) return { error: "Invitation has expired." };

  try {
    // 2. Enroll user
    await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: invitation.courseId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        courseId: invitation.courseId
      }
    });

    // 3. Delete invitation record
    await db.courseInvitation.delete({ where: { id: invitation.id } });

    revalidatePath("/mentee/my-courses");
    return { success: true, courseId: invitation.courseId };
  } catch (error) {
    return { error: "Failed to accept invitation" };
  }
}
