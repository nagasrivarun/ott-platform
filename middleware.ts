import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Define protected routes
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/watchlist") ||
    req.nextUrl.pathname.startsWith("/admin")

  // Define auth routes
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth/signin") || req.nextUrl.pathname.startsWith("/auth/signup")

  // Redirect unauthenticated users from protected routes to sign in
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/auth/signin", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/profile/:path*", "/watchlist/:path*", "/admin/:path*", "/auth/signin", "/auth/signup"],
}
