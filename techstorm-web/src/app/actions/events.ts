"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getEvents() {
  try {
    return await fetchApi("/events");
  } catch (error) {
    return [];
  }
}

export async function getUpcomingEvents() {
  try {
    return await fetchApi("/events/upcoming");
  } catch (error) {
    return [];
  }
}

export async function createEvent(data: {
  title: string;
  description: string;
  date: string;
  location: string;
  isVirtual: boolean;
  image?: string;
}) {
  try {
    const event = await fetchApi("/events", {
      method: "POST",
      body: JSON.stringify(data),
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
  try {
    await fetchApi(`/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update event" };
  }
}

export async function deleteEvent(id: string) {
  try {
    await fetchApi(`/events/${id}`, { method: "DELETE" });
    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete event" };
  }
}