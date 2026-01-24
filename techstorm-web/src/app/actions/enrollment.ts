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
    console.error("Enrollment Action Error:", error.message); // Log the real error
    if (error.message.includes("401") || error.message.includes("Unauthorized")) return { error: "UNAUTHORIZED" };
    
    return { error: error.message || "Failed to enroll" };
  }
}

export async function checkEnrollment(courseId: string) {
  try {
    return await fetchApi(`/students/courses/${courseId}/enrolled`);
  } catch (error) {
    return false;
  }
}
