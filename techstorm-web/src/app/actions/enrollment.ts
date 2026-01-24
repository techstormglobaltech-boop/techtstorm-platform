"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string): Promise<{ success?: boolean; error?: string; alreadyEnrolled?: boolean }> {
  try {
    const result = await fetchApi("/students/enroll", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
    
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/mentee/my-courses`);
    return { 
      success: true, 
      alreadyEnrolled: result.alreadyEnrolled ?? false 
    };
  } catch (error: any) {
    if (error.message.includes("401")) return { error: "UNAUTHORIZED" };
    console.error("Enrollment error:", error);
    return { error: "Failed to enroll" };
  }
}

export async function checkEnrollment(courseId: string) {
  try {
    return await fetchApi(`/students/courses/${courseId}/enrolled`);
  } catch (error) {
    return false;
  }
}
