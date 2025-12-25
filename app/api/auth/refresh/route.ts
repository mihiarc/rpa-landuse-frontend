import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: cookies,
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie headers for new token
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      setCookieHeader.split(",").forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie.trim());
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth refresh error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 502 }
    );
  }
}
