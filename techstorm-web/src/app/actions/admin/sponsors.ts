"use server";

import { fetchApi } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getSponsors() {
  try {
    return await fetchApi("/sponsors");
  } catch (error) {
    return [];
  }
}

export async function createSponsor(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const order = Number(formData.get("order") || 0);

  try {
    await fetchApi("/sponsors", {
      method: "POST",
      body: JSON.stringify({ name, logoUrl, websiteUrl, order }),
    });
    revalidatePath("/admin/sponsors");
    return { success: true, message: "Sponsor added successfully" };
  } catch (error) {
    return { success: false, message: "Failed to add sponsor" };
  }
}

export async function deleteSponsor(id: string) {
  try {
    await fetchApi(`/sponsors/${id}`, { method: "DELETE" });
    revalidatePath("/admin/sponsors");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to delete sponsor" };
  }
}
