"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function getUsers(role: UserRole) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return [];

  const users = await db.user.findMany({
    where: { role },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          coursesTeaching: true, // For Mentors
          enrollments: true,      // For Mentees
        }
      }
    }
  });

  return users;
}

export async function updateUser(userId: string, data: { name: string; email: string; role: UserRole }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role
      }
    });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update user." };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  try {
    await db.user.update({
      where: { id: userId },
      data: { status: newStatus as any }
    });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true, newStatus };
  } catch (error) {
    return { error: "Failed to update user status." };
  }
}

export async function createUser(data: { name: string; email: string; role: UserRole; password?: string }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  const { name, email, role, password } = data;

  // Check if user exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { error: "User with this email already exists." };

  // Use provided password or default to 'password123'
  const passwordToHash = password || "password123"; 
  const hashedPassword = await bcrypt.hash(passwordToHash, 10);

  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    });

    revalidatePath(`/admin/${role.toLowerCase()}s`); 
    return { success: true };
  } catch (error) {
    return { error: "Failed to create user." };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await db.user.delete({ where: { id: userId } });
    revalidatePath("/admin/mentors");
    revalidatePath("/admin/mentees");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user." };
  }
}
