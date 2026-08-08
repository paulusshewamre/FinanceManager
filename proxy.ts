import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware enforcing session protection across protected pages and API endpoints.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exempt static assets and public auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check for Better Auth HTTP-only session cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    // Return 401 JSON for unauthenticated API requests
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Redirect unauthenticated page requests to /login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files (_next/static, _next/image, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
