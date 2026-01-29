"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getMyProfile() {
  try {
    return await fetchApi("/users/profile");
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

export async function updateMyProfile(data: any) {
  try {
    await fetchApi("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath("/mentor/settings");
    revalidatePath("/mentee/settings");
    revalidatePath("/team"); // Revalidate team page if it's dynamic
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: "Failed to update profile" };
  }
}

export async function getPublicMentors() {
  try {
    return await fetchApi("/users/mentors", { cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch public mentors:", error);
    return [];
  }
}
