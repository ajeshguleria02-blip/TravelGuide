import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuthenticated = request.cookies.has("token");

    const isAuthPage =
        pathname.startsWith("/log-in") ||
        pathname.startsWith("/sign-up");

    // Logged-in users cannot visit auth pages
    if (isAuthenticated && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/log-in/:path*", "/sign-up/:path*"],
};