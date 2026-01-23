"use server";

import { fetchApi } from "@/lib/api-client";

export async function getAdminStats() {
  try {
    return await fetchApi("/reports/admin-dashboard");
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return null;
  }
}