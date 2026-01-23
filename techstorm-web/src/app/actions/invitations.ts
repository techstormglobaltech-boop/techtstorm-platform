"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function inviteStudent(courseId: string, email: string) {
  try {
    await fetchApi("/invitations/invite", {
      method: "POST",
      body: JSON.stringify({ courseId, email }),
    });
    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
    return { error: "Failed to send invitation" };
  }
}

export async function acceptInvitation(token: string) {
  try {
    const result = await fetchApi("/invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    revalidatePath("/mentee/my-courses");
    return { success: true, courseId: result.courseId };
  } catch (error) {
    console.error("Accept invitation error:", error);
    return { error: "Failed to accept invitation" };
  }
}
