import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const PUBLIC_PATHS = ["/login", "/favicon.ico", "/_next", "/static"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths without session check
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = req.cookies.get("session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/dashboard", "/ops/:path*"],
}
