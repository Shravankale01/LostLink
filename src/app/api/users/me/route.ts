// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/userModels";
import { getCurrentUserId } from "@/helpers/getCurrentUser";

export async function GET() {
  try {
    await connectDB();
    const userId = getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId).select("_id username email");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

