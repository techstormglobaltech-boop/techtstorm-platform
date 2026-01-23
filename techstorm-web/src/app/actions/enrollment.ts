"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function enrollInCourse(courseId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "UNAUTHORIZED" };
  }

  // Check if already enrolled
  const existingEnrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
  });

  if (existingEnrollment) {
    return { success: true, alreadyEnrolled: true };
  }

  // Create enrollment
  try {
    await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
      },
    });
    
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/mentee/my-courses`);
    return { success: true };
  } catch (error) {
    console.error("Enrollment error:", error);
    return { error: "Failed to enroll" };
  }
}
