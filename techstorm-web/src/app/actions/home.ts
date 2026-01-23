"use server";

import { fetchApi } from "@/lib/api-client";

export async function getHomeData() {
  try {
    return await fetchApi("/public/home");
  } catch (error) {
    console.error("Home data fetch error:", error);
    return null;
  }
}
