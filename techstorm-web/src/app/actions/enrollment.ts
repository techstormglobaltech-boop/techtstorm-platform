"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export interface EnrollmentResult {
  success?: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  paymentReference?: string | null;
}

export async function enrollInCourse(
  courseId: string,
  paymentReference?: string,
): Promise<EnrollmentResult> {
  try {
    const result = await fetchApi("/students/enroll", {
      method: "POST",
      body: JSON.stringify({ courseId, paymentReference }),
    });

    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/mentee/my-courses`);
    return {
      success: true,
      alreadyEnrolled: result.alreadyEnrolled ?? false,
      status: result.status,
      paymentReference: result.paymentReference,
    };
  } catch (error: any) {
    console.error("Enrollment Action Error:", error.message);
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return { error: "UNAUTHORIZED" };
    }

    return { error: error.message || "Failed to enroll" };
  }
}

export async function checkEnrollment(courseId: string): Promise<{
  isEnrolled: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  paymentReference?: string | null;
}> {
  try {
    const result = await fetchApi(`/students/courses/${courseId}/enrolled`);
    if (typeof result === "boolean") {
      return { isEnrolled: result, status: result ? "APPROVED" : null };
    }
    return result || { isEnrolled: false, status: null };
  } catch (error) {
    return { isEnrolled: false, status: null };
  }
}
