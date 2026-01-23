"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getGalleryImages() {
  try {
    // Try standard way first
    try {
        return await db.galleryImage.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (e) {
        console.warn("Standard query failed, trying raw query...", e);
        // Fallback for stale client
        return await db.$queryRawUnsafe('SELECT * FROM "GalleryImage" ORDER BY "createdAt" DESC') as any[];
    }
  } catch (error) {
    console.error("All gallery queries failed:", error);
    return [];
  }
}

export async function addGalleryImage(data: { url: string; title: string; category: string; description: string }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.galleryImage.create({
      data: {
        url: data.url,
        title: data.title,
        category: data.category,
        description: data.description
      }
    });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    return { error: "Failed to add image" };
  }
}

export async function deleteGalleryImage(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.galleryImage.delete({ where: { id } });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete image" };
  }
}
