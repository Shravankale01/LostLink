import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    user.isVerified = true;  // Corrected spelling here
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return NextResponse.redirect(`${process.env.DOMAIN}/login?verified=true`);
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
