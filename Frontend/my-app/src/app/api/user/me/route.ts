import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1] || "";
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication token is required" },
        { status: 401 }
      );
    }

    // Make a request to the backend to verify and get user information
    const response = await fetch("http://localhost:8000/user/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to authenticate user");
    }

    const userData = await response.json();
    return NextResponse.json(userData, { status: 200 });
    
  } catch (error: any) {
    console.error("User authentication error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate user" },
      { status: error.status || 500 }
    );
  }
}