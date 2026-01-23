"use server";

import { fetchApi } from "@/lib/api-client";

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
