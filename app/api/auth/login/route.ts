import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Create response with the data
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie headers from backend to browser
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Parse and forward each cookie
      setCookieHeader.split(",").forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie.trim());
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Failed to connect to server" },
      { status: 502 }
    );
  }
}
