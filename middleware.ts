import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/agents", "/tools", "/knowledge", "/runs", "/audit"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      storage: {
        getItem: (key) => request.cookies.get(key)?.value ?? null,
        setItem: (key, value) => {
          request.cookies.set(key, value);
          response = NextResponse.next({ request });
          response.cookies.set(key, value, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });
        },
        removeItem: (key) => {
          request.cookies.delete(key);
          response = NextResponse.next({ request });
          response.cookies.delete(key);
        },
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = protectedRoutes.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`),
  );

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/agents/:path*", "/tools/:path*", "/knowledge/:path*", "/runs/:path*", "/audit/:path*"],
};
