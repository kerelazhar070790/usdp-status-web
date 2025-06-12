import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
  })
  return response
}
