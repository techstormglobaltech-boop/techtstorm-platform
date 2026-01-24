import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse, NextRequest } from "next/server";

const { auth } = NextAuth({
  ...authConfig,
  trustHost: true,
});

export default async function proxy(req: NextRequest) {
  const host = req.headers.get("host");
  const isLocalhost = host?.includes("localhost") || host?.includes("127.0.0.1");

  // Only set the forwarded proto if we are NOT on localhost
  if (req.headers && !isLocalhost) {
    req.headers.set('x-forwarded-proto', 'https');
  }

  try {
    return await auth(req);
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    // In case of auth error, we might want to allow the request to proceed 
    // to avoid blocking the entire site, or redirect to an error page.
    // For now, let's allow it but log the error.
    return NextResponse.next();
  }
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\.png$).*)'],
};