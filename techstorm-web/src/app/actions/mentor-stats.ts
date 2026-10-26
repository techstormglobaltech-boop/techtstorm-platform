"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getMentorStats() {
  try {
    return await fetchApi("/reports/mentor-dashboard");
  } catch (error) {
    console.error("Failed to fetch mentor stats:", error);
    return null;
  }
}

export async function getStudentsForMentor() {
  try {
    return await fetchApi("/courses/mentor/students");
  } catch (error) {
    console.error("Failed to fetch students for mentor:", error);
    return [];
  }
}

export async function getPendingEnrollmentsForMentor() {
  try {
    return await fetchApi("/courses/mentor/enrollments/pending");
  } catch (error) {
    console.error("Failed to fetch pending enrollments:", error);
    return [];
  }
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "APPROVED" | "REJECTED",
) {
  try {
    const result = await fetchApi(`/courses/mentor/enrollments/${enrollmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    revalidatePath("/mentor/students");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to update enrollment status:", error);
    return { success: false, error: error.message || "Failed to update enrollment status" };
  }
}
