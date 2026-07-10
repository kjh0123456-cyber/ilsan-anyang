import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Prefix-matched: these and every sub-path underneath require auth.
const PROTECTED_PREFIXES = ["/orders", "/admin"];
// Exact-matched: /checkout needs auth, but /checkout/success and
// /checkout/fail don't — they're the Toss redirect-back landing pages
// and already handle an unauthenticated visitor gracefully themselves.
// Prefix-matching "/checkout" was catching those too, so a lapsed
// session on the way back from Toss showed a login wall instead of the
// actual payment result.
const PROTECTED_EXACT = ["/checkout"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    PROTECTED_PREFIXES.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    ) || PROTECTED_EXACT.includes(request.nextUrl.pathname);

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set(
      "redirect",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
