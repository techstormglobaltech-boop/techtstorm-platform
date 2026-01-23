"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(data: { name: string; image?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        ...(data.image && { image: data.image })
      }
    });

    revalidatePath("/mentee/settings");
    revalidatePath("/mentee"); // Update sidebar
    return { success: true };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

export async function updatePassword(data: { current: string; new: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) {
      return { error: "User not found" };
    }

    const passwordsMatch = await bcrypt.compare(data.current, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(data.new, 10);
    
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to update password" };
  }
}

// Admin Global Settings
export async function getGlobalSettings() {
  try {
    let settings = await db.globalSetting.findUnique({
      where: { id: "system_settings" }
    });

    if (!settings) {
      settings = await db.globalSetting.create({
        data: {
          id: "system_settings",
          maintenanceMode: false,
          platformName: "TechStorm Global",
          supportEmail: "hello@techstormglobal.com"
        }
      });
    }
    return settings;
  } catch (error) {
    return null;
  }
}

export async function updateGlobalSettings(data: { maintenanceMode: boolean; platformName: string; supportEmail: string }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.globalSetting.upsert({
      where: { id: "system_settings" },
      update: { ...data },
      create: { id: "system_settings", ...data }
    });
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update settings" };
  }
}