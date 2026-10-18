import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/manager") && req.nextauth.token?.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                const isProtectedRoute = pathname.startsWith("/manager") || pathname === "/post/create" || /^\/post\/[^/]+\/modify$/.test(pathname);

                if (!isProtectedRoute) {
                    return true;
                }

                return !!token;
            },
        },
        pages: {
            signIn: "/login",
        },
    },
);

export const config = {
    matcher: ["/manager/:path*", "/post/create", "/post/:id/modify"],
};
