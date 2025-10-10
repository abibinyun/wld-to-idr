import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/firebase";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Routes that should redirect authenticated users
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  try {
    // Get the token from the request
    const token = request.cookies.get("auth-token")?.value;

    if (isProtectedRoute && !token) {
      // Redirect to login if accessing protected route without token
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isPublicRoute && token) {
      // Redirect to dashboard if accessing public route with token
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check admin route access
    if (pathname.startsWith("/admin")) {
      // In a real app, you would verify the token and check user role
      // For now, we'll just check for a specific email pattern
      // This is a simplified check - implement proper role-based access
      const userEmail = request.cookies.get("user-email")?.value;
      if (userEmail !== "abii.manyun@gmail.com") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// =========================================

// export function middleware() {
//   return NextResponse.next();
// }
