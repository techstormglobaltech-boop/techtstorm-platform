import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@/types/user";
 
function parseJwtExp(tokenStr?: string): number | null {
  if (!tokenStr) return null;
  try {
    const parts = tokenStr.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr =
      typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64").toString("utf-8")
        : atob(base64);
    const parsed = JSON.parse(jsonStr);
    return parsed.exp ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isExpired = auth?.error === "SessionExpired";
      const userRole = auth?.user?.role as string;
      
      const isUrl = (path: string) => nextUrl.pathname.startsWith(path);
      
      const isAdminPage = isUrl('/admin');
      const isMentorPage = isUrl('/mentor');
      const isMenteePage = isUrl('/mentee');
      const isLearnPage = isUrl('/learn');
      const isDashboardPage = isAdminPage || isMentorPage || isMenteePage || isLearnPage;

      if (isDashboardPage) {
        if (!isLoggedIn || isExpired) {
          const loginUrl = new URL("/login", nextUrl);
          loginUrl.searchParams.set("reason", "session_expired");
          loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
          return Response.redirect(loginUrl);
        }

        // Role-based protection
        if (isAdminPage && userRole !== UserRole.ADMIN) {
           return Response.redirect(new URL("/", nextUrl));
        }
        if (isMentorPage && userRole !== UserRole.MENTOR && userRole !== UserRole.ADMIN) {
           return Response.redirect(new URL("/", nextUrl));
        }
        if (isMenteePage && userRole !== UserRole.MENTEE && userRole !== UserRole.ADMIN) {
           return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // If logged in and on a public page, redirect to dashboard (only if not expired)
      const isPublicActionPage = nextUrl.pathname === "/login" || 
                                 nextUrl.pathname === "/register" ||
                                 nextUrl.pathname === "/";

      if (isLoggedIn && !isExpired && isPublicActionPage) {
        let redirectUrl = "/mentee";
        if (userRole === UserRole.ADMIN) redirectUrl = "/admin";
        else if (userRole === UserRole.MENTOR) redirectUrl = "/mentor";
        
        // Use the actual host from the request headers to prevent cross-origin CORS issues 
        // between www and non-www domains.
        const host = request.headers?.get?.("host") || nextUrl.host;
        const protocol = request.headers?.get?.("x-forwarded-proto") || "https";
        const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : `${protocol}://${host}`;
        
        return Response.redirect(new URL(redirectUrl, baseUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (token.accessToken && session.user) {
        session.user.accessToken = token.accessToken as string;
      }
      if (token.picture && session.user) {
        session.user.image = token.picture as string;
      }
      if (token.name && session.user) {
        session.user.name = token.name as string;
      }
      if (token.error) {
        session.error = token.error as string;
      }
      if (token.accessTokenExpires) {
        session.expiresAt = token.accessTokenExpires as number;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.accessToken = (user as any).accessToken;
        if ((user as any).image) {
          token.picture = (user as any).image;
        }

        const expMs = parseJwtExp((user as any).accessToken);
        if (expMs) {
          token.accessTokenExpires = expMs;
        } else {
          // Default: 30 days
          token.accessTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000;
        }
      }

      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
      }

      // Check if access token is expired
      if (token.accessTokenExpires && Date.now() > (token.accessTokenExpires as number)) {
        return {
          ...token,
          error: "SessionExpired",
        };
      }

      return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;
