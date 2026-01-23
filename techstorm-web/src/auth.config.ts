import type { NextAuthConfig } from "next-auth";
 
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      
      const isUrl = (path: string) => nextUrl.pathname.startsWith(path);
      
      const isAdminPage = isUrl('/admin');
      const isMentorPage = isUrl('/mentor');
      const isMenteePage = isUrl('/mentee');
      const isLearnPage = isUrl('/learn');
      const isDashboardPage = isAdminPage || isMentorPage || isMenteePage || isLearnPage;

      if (isDashboardPage) {
        if (!isLoggedIn) return false;

        // Role-based protection
        if (isAdminPage && userRole !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        if (isMentorPage && userRole !== "MENTOR" && userRole !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        if (isMenteePage && userRole !== "MENTEE" && userRole !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
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
        if (userRole === "ADMIN") redirectUrl = "/admin";
        else if (userRole === "MENTOR") redirectUrl = "/mentor";
        
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      return true;
    },
    // Add user role to the session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as "ADMIN" | "MENTOR" | "MENTEE";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;