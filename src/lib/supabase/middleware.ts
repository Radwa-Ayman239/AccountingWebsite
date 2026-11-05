import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "mohaseb_local_session";

function isSupabaseActive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
    key &&
    url.startsWith("http") &&
    !url.includes("your-supabase-url") &&
    !url.includes("placeholder.supabase.co")
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/api/admin");

  // ============================================================================
  // Standalone Local Database Mode
  // ============================================================================
  if (!isSupabaseActive()) {
    const localSession = request.cookies.get(SESSION_COOKIE_NAME);
    let userRole = "viewer";
    let isLoggedIn = false;

    if (localSession?.value) {
      try {
        const parsed = JSON.parse(localSession.value) as { role?: string };
        userRole = parsed.role ?? "viewer";
        isLoggedIn = true;
      } catch {
        isLoggedIn = false;
      }
    }

    if (!isLoggedIn && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (isLoggedIn && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Role-Based Middleware Protection
    if (isAdminRoute && userRole !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "403 Forbidden: Admin privileges required" },
          { status: 403 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ============================================================================
  // Supabase Cloud Mode (Layer 2: Auth Token & app_metadata inspection)
  // ============================================================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Check admin role via app_metadata in JWT claim
  if (user && isAdminRoute) {
    const role = user.app_metadata?.role;
    if (role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "403 Forbidden: Admin privileges required" },
          { status: 403 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
