"use server";

import { fetchApi } from "@/lib/api-client";

export async function getPublicTestimonials() {
  try {
    return await fetchApi("/testimonials");
  } catch (error) {
    console.error("Testimonials fetch error:", error);
    return [];
  }
}
