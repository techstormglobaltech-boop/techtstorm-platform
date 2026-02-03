"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getTestimonials() {
  try {
    return await fetchApi("/testimonials");
  } catch (error) {
    return [];
  }
}

export async function createTestimonial(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const content = formData.get("content") as string;
  const image = formData.get("image") as string;
  const company = formData.get("company") as string;
  const rating = Number(formData.get("rating") || 5);

  try {
    await fetchApi("/testimonials", {
      method: "POST",
      body: JSON.stringify({ name, role, content, image, company, rating }),
    });
    revalidatePath("/admin/testimonials");
    return { success: true, message: "Testimonial added successfully" };
  } catch (error) {
    return { success: false, message: "Failed to add testimonial" };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await fetchApi(`/testimonials/${id}`, { method: "DELETE" });
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete testimonial" };
  }
}
