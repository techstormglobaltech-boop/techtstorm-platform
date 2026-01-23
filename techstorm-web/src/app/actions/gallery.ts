"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getGalleryImages() {
  try {
    return await fetchApi("/gallery");
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return [];
  }
}

export async function addGalleryImage(data: { url: string; title: string; category: string; description: string }) {
  try {
    await fetchApi("/gallery", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    console.error("Failed to add gallery image:", error);
    return { error: "Failed to add image" };
  }
}

export async function deleteGalleryImage(id: string) {
  try {
    await fetchApi(`/gallery/${id}`, { method: "DELETE" });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return { error: "Failed to delete image" };
  }
}
