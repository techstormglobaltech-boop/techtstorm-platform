import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  const isDashboardPage = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/mentor") || 
    pathname.startsWith("/mentee") || 
    pathname.startsWith("/learn");

  if (isDashboardPage) {
    const hasSessionCookie = request.cookies.getAll().some(
      (c) => c.name.includes("session-token") && c.value
    );

    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mentor/:path*",
    "/mentee/:path*",
    "/learn/:path*",
  ],
};

export { proxy as middleware };
