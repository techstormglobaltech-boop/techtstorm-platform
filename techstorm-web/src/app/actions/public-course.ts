"use server";

import { fetchApi } from "@/lib/api-client";

export async function getPublishedCourses() {
  try {
    return await fetchApi("/public/courses");
  } catch (error) {
    console.error("Failed to fetch published courses:", error);
    return [];
  }
}

export async function getCourseById(id: string) {
  try {
    return await fetchApi(`/public/courses/${id}`);
  } catch (error) {
    console.error("Failed to fetch course by ID:", error);
    return null;
  }
}
