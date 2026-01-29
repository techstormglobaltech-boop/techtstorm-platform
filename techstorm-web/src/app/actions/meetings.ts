"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function createMeeting(data: {
  title: string;
  description?: string;
  startTime: string;
  link: string;
  courseId: string;
  isRecurring?: boolean;
  daysOfWeek?: string[]; // e.g. ["1", "3", "5"] for Mon, Wed, Fri
  endDate?: string;
}) {
  try {
    await fetchApi("/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    console.error("Meeting creation error:", error);
    return { error: "Failed to schedule sessions" };
  }
}

export async function getMentorMeetings() {
  try {
    return await fetchApi("/meetings/mentor");
  } catch (error) {
    return [];
  }
}

export async function getMenteeMeetings() {
  try {
    return await fetchApi("/meetings/mentee");
  } catch (error) {
    return [];
  }
}

export async function getEnrolledCourses() {
  try {
    const enrollments = await fetchApi("/students/enrolled-courses");
    if (Array.isArray(enrollments)) {
        return enrollments.map((e: any) => e.course);
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function approveSession(meetingId: string, link: string) {
  try {
    await fetchApi(`/meetings/${meetingId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ link }),
    });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to approve session" };
  }
}

export async function rejectSession(meetingId: string) {
  try {
    await fetchApi(`/meetings/${meetingId}/reject`, { method: "PATCH" });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to reject session" };
  }
}

export async function requestSession(data: {
  title: string;
  description: string;
  startTime: string;
  courseId: string;
}) {
  try {
    await fetchApi("/meetings/request", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    console.error("Booking error:", error);
    return { error: "Failed to request session" };
  }
}

export async function deleteMeeting(id: string) {
  try {
    await fetchApi(`/meetings/${id}`, { method: "DELETE" });
    revalidatePath("/mentor/schedule");
    revalidatePath("/mentee/schedule");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete meeting" };
  }
}