"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getCourses() {
  try {
    return await fetchApi("/courses");
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

export async function generateAICourse(topic: string, level: string) {
  try {
    const course = await fetchApi("/courses/generate-ai", {
      method: "POST",
      body: JSON.stringify({ topic, level }),
    });

    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { error: "Failed to generate course" };
  }
}

export async function createCourse(title: string) {
  try {
    const course = await fetchApi("/courses", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    
    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    return { error: "Failed to create course" };
  }
}

export async function deleteCourse(id: string) {
  try {
    await fetchApi(`/courses/${id}`, { method: "DELETE" });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete course" };
  }
}

export async function toggleCourseStatus(id: string, currentStatus: string) {
  try {
    const updatedCourse = await fetchApi(`/courses/${id}/toggle-status`, {
      method: "POST",
    });
    revalidatePath("/admin/courses");
    revalidatePath("/mentor/courses");
    return { success: true, newStatus: updatedCourse.status };
  } catch (error) {
    return { error: "Failed to update status" };
  }
}