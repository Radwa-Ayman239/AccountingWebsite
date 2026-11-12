import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

// Hardcoded user data - ID matches database schema
const HARDCODED_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "Adel Mohamed123",
  email: "adel@example.com",
  role: "admin",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect register to login since registration is disabled
  if (pathname.startsWith("/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth");

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/api/admin");

  // Check for hardcoded auth session cookie
  const cookieStore = await cookies();
  const authSession = cookieStore.get("auth_session");

  let user = null;
  if (authSession) {
    try {
      const sessionData = JSON.parse(authSession.value);
      if (sessionData.username === HARDCODED_USER.username) {
        user = HARDCODED_USER;
      }
    } catch (e) {
      // Invalid cookie, ignore
    }
  }

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // All authenticated users are admins in this setup
  // No need for additional admin checks

  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
