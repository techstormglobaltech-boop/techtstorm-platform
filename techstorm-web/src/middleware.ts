import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default async function middleware(req: any) {
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