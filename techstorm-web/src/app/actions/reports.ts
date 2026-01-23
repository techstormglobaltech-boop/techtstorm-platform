"use server";

import { fetchApi } from "@/lib/api-client";

export async function getPlatformReports() {
  try {
    return await fetchApi("/reports/platform");
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return null;
  }
}