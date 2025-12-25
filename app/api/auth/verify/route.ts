import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/verify`, {
      method: "GET",
      headers: {
        Cookie: cookies,
      },
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward any Set-Cookie headers (for cookie refresh)
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      setCookieHeader.split(",").forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie.trim());
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Failed to verify" },
      { status: 502 }
    );
  }
}
