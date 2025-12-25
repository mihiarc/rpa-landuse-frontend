import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register-academic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie headers from backend to browser
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      setCookieHeader.split(",").forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie.trim());
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth register-academic error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Failed to register" },
      { status: 502 }
    );
  }
}
