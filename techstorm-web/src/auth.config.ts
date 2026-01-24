import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@/types/user";
 
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Force http for localhost, otherwise use the request protocol
      const isLocal = nextUrl.hostname === "localhost" || nextUrl.hostname === "127.0.0.1";
      const protocol = isLocal ? "http:" : nextUrl.protocol;
      
      const host = nextUrl.host || 'localhost:3000';
      const baseUrl = `${protocol}//${host}`;
      
      const userRole = auth?.user?.role as string;
      
      const isUrl = (path: string) => nextUrl.pathname.startsWith(path);
      
      const isAdminPage = isUrl('/admin');
      const isMentorPage = isUrl('/mentor');
      const isMenteePage = isUrl('/mentee');
      const isLearnPage = isUrl('/learn');
      const isDashboardPage = isAdminPage || isMentorPage || isMenteePage || isLearnPage;

      if (isDashboardPage) {
        if (!isLoggedIn) return false;

        // Role-based protection
        if (isAdminPage && userRole !== UserRole.ADMIN) {
          return Response.redirect(new URL("/", baseUrl));
        }
        if (isMentorPage && userRole !== UserRole.MENTOR && userRole !== UserRole.ADMIN) {
          return Response.redirect(new URL("/", baseUrl));
        }
        if (isMenteePage && userRole !== UserRole.MENTEE && userRole !== UserRole.ADMIN) {
          return Response.redirect(new URL("/", baseUrl));
        }
        
        // Learn page allows Mentee, Mentor, and Admin
        return true;
      }

      // If logged in and on a public page like login, register or the root home page, 
      // redirect them to their respective dashboard.
      const isPublicActionPage = nextUrl.pathname === "/login" || 
                                 nextUrl.pathname === "/register" ||
                                 nextUrl.pathname === "/";

      if (isLoggedIn && isPublicActionPage) {
        let redirectUrl = "/mentee";
        if (userRole === UserRole.ADMIN) redirectUrl = "/admin";
        else if (userRole === UserRole.MENTOR) redirectUrl = "/mentor";
        
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
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;
