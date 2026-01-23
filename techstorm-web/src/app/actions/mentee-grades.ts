"use server";

import { fetchApi } from "@/lib/api-client";

export async function getStudentGrades() {
  try {
    const data = await fetchApi("/students/grades");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching grades:", error);
    return { success: false, error: "Failed to load grades" };
  }
}
