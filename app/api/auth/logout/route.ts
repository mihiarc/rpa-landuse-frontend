import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: cookies,
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie headers to clear the cookie
    // Use getSetCookie() to properly handle cookies with commas in Expires dates
    const cookies = response.headers.getSetCookie?.() || [];
    if (cookies.length > 0) {
      cookies.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    } else {
      // Fallback for older Node versions without getSetCookie
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        nextResponse.headers.append("Set-Cookie", setCookieHeader);
      }
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth logout error:", error);
    return NextResponse.json(
      { message: "Logged out" },
      { status: 200 }
    );
  }
}
