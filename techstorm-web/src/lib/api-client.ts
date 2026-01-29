import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  const token = session?.user?.accessToken;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized by potentially redirecting or refreshing
    if (response.status === 401) {
      console.error("Unauthorized API call");
    }
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  const text = await response.text();
  try {
      return text ? JSON.parse(text) : {};
  } catch (e) {
      console.error("Failed to parse JSON response:", text);
      return {};
  }
}
