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
  const callbackUrl = formData.get("callbackUrl")?.toString();
  
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: callbackUrl || "/login", 
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
    
    // Always return success message for security, or the backend message
    // Backend returns: { message: '...' }
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
