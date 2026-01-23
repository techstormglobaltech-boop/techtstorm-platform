import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          try {
            const res = await fetch(`${API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            if (!res.ok) return null;

            const data = await res.json();
            // data should contain { access_token, user: { id, email, role, ... } }
            
            if (data.user && data.access_token) {
              return {
                ...data.user,
                accessToken: data.access_token,
              };
            }
          } catch (error) {
            console.error("Login error:", error);
            return null;
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});