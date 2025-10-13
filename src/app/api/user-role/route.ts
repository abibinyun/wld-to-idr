import { NextRequest, NextResponse } from "next/server";
import { getUserRole } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  }

  try {
    const role = await getUserRole(uid);

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
