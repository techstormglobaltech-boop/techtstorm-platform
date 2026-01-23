"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  return await db.event.findMany({
    orderBy: { date: "asc" }
  });
}

export async function getUpcomingEvents() {
  return await db.event.findMany({
    where: {
      date: {
        gte: new Date()
      }
    },
    orderBy: { date: "asc" }
  });
}

export async function createEvent(data: {
  title: string;
  description: string;
  date: string;
  location: string;
  isVirtual: boolean;
  image?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const event = await db.event.create({
      data: {
        ...data,
        date: new Date(data.date),
      }
    });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true, event };
  } catch (error) {
    return { error: "Failed to create event" };
  }
}

export async function editEvent(id: string, data: {
  title: string;
  description: string;
  date: string;
  location: string;
  isVirtual: boolean;
  image?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.event.update({
      where: { id },
      data: {
        ...data,
        date: new Date(data.date),
      }
    });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update event" };
  }
}

export async function deleteEvent(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.event.delete({ where: { id } });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete event" };
  }
}
