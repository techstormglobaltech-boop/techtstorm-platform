"use server";

import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api-client";

export async function getTeamMembers() {
  try {
    return await fetchApi("/public/team");
  } catch (error) {
    return [];
  }
}

export async function createTeamMember(data: any) {
  try {
    await fetchApi("/admin/team", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/admin/team");
    revalidatePath("/team"); // Public page
    return { success: true };
  } catch (error) {
    return { error: "Failed to create team member" };
  }
}

export async function updateTeamMember(id: string, data: any) {
  try {
    await fetchApi(`/admin/team/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update team member" };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await fetchApi(`/admin/team/${id}`, { method: "DELETE" });
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete team member" };
  }
}
