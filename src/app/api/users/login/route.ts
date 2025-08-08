import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // **REMOVE EMAIL VERIFICATION CHECK HERE**

    const tokenData = {
      id: user._id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRETKEY!, {
      expiresIn: "1d",
    });

    const res = NextResponse.json({
      message: "Login successful",
      redirectTo: user.isAdmin ? "/admin" : "/add_item",
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return res;
  } catch (error: unknown) {
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Login error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
