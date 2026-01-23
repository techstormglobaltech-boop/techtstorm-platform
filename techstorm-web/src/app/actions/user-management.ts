"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@/types/user";
import { fetchApi } from "@/lib/api-client";

export async function getUsers(role: UserRole) {
  try {
    return await fetchApi(`/admin/users?role=${role}`);
  } catch (error) {
    return [];
  }
}

export async function updateUser(userId: string, data: { name: string; email: string; role: UserRole }) {
  try {
    await fetchApi(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update user." };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  try {
    await fetchApi(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true, newStatus };
  } catch (error) {
    return { error: "Failed to update user status." };
  }
}

export async function createUser(data: { name: string; email: string; role: UserRole; password?: string }) {
  try {
    await fetchApi("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });

    revalidatePath(`/admin/${data.role.toLowerCase()}s`); 
    return { success: true };
  } catch (error) {
    return { error: "Failed to create user." };
  }
}

export async function deleteUser(userId: string) {
  try {
    await fetchApi(`/admin/users/${userId}`, { method: "DELETE" });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}