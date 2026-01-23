"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function updateProfile(data: { name: string; image?: string }) {
  try {
    await fetchApi("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    revalidatePath("/mentee/settings");
    revalidatePath("/mentee"); // Update sidebar
    return { success: true };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

export async function updatePassword(data: { current: string; new: string }) {
  try {
    await fetchApi("/auth/password", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to update password" };
  }
}

// Admin Global Settings
export async function getGlobalSettings() {
  try {
    return await fetchApi("/admin/settings");
  } catch (error) {
    return null;
  }
}

export async function updateGlobalSettings(data: { maintenanceMode: boolean; platformName: string; supportEmail: string }) {
  try {
    await fetchApi("/admin/settings", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}

export async function getMaintenanceMode() {
  try {
    return await fetchApi("/public/maintenance");
  } catch (error) {
    return false;
  }
}
