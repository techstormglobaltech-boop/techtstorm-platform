"use server";

import { fetchApi } from "@/lib/api-client";

export async function getLatestNewsletter() {
  try {
    return await fetchApi("/newsletters/latest");
  } catch (error) {
    console.error("Failed to fetch latest newsletter:", error);
    return null;
  }
}

export async function getAllNewsletters() {
  try {
    return await fetchApi("/newsletters");
  } catch (error) {
    console.error("Failed to fetch all newsletters:", error);
    return [];
  }
}
