"use server";

import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, name } = validatedFields.data;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Something went wrong" };
    }

    return { success: "Account created!" };

  } catch (error) {
    return { error: "Something went wrong" };
  }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const rawCallbackUrl = formData.get("callbackUrl")?.toString();
  const callbackUrl = rawCallbackUrl && !rawCallbackUrl.startsWith("/login") && rawCallbackUrl.trim() !== ""
    ? rawCallbackUrl 
    : undefined;

  if (!email || !password) {
    return "Please provide both email and password.";
  }
  
  try {
    // 1. Pre-authenticate with the backend API to determine user role and receive accurate error responses
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return data.message || "Invalid credentials.";
    }

    const userRole = data.user?.role;

    // 2. Determine target redirection based on user role and permissions
    let targetUrl = callbackUrl;

    if (!targetUrl || targetUrl === "/" || targetUrl === "/login") {
      if (userRole === "ADMIN") {
        targetUrl = "/admin";
      } else if (userRole === "MENTOR") {
        targetUrl = "/mentor";
      } else {
        targetUrl = "/mentee";
      }
    } else {
      // Validate callbackUrl access permissions
      if (targetUrl.startsWith("/admin") && userRole !== "ADMIN") {
        targetUrl = userRole === "MENTOR" ? "/mentor" : "/mentee";
      } else if (targetUrl.startsWith("/mentor") && userRole !== "MENTOR" && userRole !== "ADMIN") {
        targetUrl = "/mentee";
      } else if (targetUrl.startsWith("/mentee") && userRole !== "MENTEE" && userRole !== "ADMIN") {
        targetUrl = userRole === "MENTOR" ? "/mentor" : "/admin";
      }
    }

    // 3. Complete NextAuth sign-in with the role-appropriate destination
    await signIn("credentials", {
      email,
      password,
      redirectTo: targetUrl, 
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPassword(prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");

  const validatedFields = z.object({ email: z.string().email() }).safeParse({ email });

  if (!validatedFields.success) {
    return "Invalid email address.";
  }

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: validatedFields.data.email }),
    });
    
    const data = await res.json();
    if (!res.ok) return data.message || "Something went wrong.";
    
    return "Check your email for a password reset link.";
  } catch (error) {
    return "Failed to send request.";
  }
}

export async function resetPassword(prevState: string | undefined, formData: FormData) {
  const password = formData.get("password");
  const token = formData.get("token");

  const validatedFields = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    token: z.string().min(1, "Invalid token"),
  }).safeParse({ password, token });

  if (!validatedFields.success) {
    return validatedFields.error.issues[0].message;
  }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        token: validatedFields.data.token, 
        password: validatedFields.data.password 
      }),
    });

    const data = await res.json();
    if (!res.ok) return data.message || "Failed to reset password.";

    return "Password has been reset successfully. You can now login.";
  } catch (error) {
    return "Something went wrong.";
  }
}
