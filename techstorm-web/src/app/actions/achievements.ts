"use server";

import { fetchApi } from "@/lib/api-client";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: Date | null; // null if locked
  progress: number; // 0 to 100
};

export async function getStudentAchievements() {
  try {
    const data = await fetchApi("/students/achievements");
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return { success: false, error: "Failed to load achievements" };
  }
}
