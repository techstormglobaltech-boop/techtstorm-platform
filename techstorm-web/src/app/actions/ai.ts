"use server";

import { fetchApi } from "@/lib/api-client";

export async function askAiTutor(code: string, assignmentDescription: string) {
  try {
    const response = await fetchApi("/ai/code-review", {
      method: "POST",
      body: JSON.stringify({ code, assignmentDescription }),
    });
    return { success: true, feedback: response.feedback };
  } catch (error) {
    console.error("AI Tutor error:", error);
    return { success: false, error: "Failed to connect to AI Tutor" };
  }
}
