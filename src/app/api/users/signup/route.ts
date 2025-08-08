// app/api/signup/route.ts
// app/api/users/signup/route.ts
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/sendMail";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { username, email, password } = await request.json();

    if (await User.findOne({ email })) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,  // Corrected spelling here
      verifyToken: verificationToken,
      verifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    });
    await newUser.save();

    const verifyUrl = `${process.env.DOMAIN}/api/users/verify?token=${verificationToken}`;
    const html = `
      <p>Hello ${username},</p>
      <p>Click <a href="${verifyUrl}">this link</a> to verify your email. It expires in 24 hours.</p>
      <p><em>Note: Since this is running on localhost, the verification may not complete successfully. However, you can still log in using your credentials.</em></p>
    `;
    await sendMail({ to: email, subject: "Verify your email", html });

    return NextResponse.json(
      {
        message: "Signup successful! Check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    let errorMessage = "Internal server error";
    if (err instanceof Error) {
      errorMessage = err.message;
      console.error("Signup error:", errorMessage);
    } else {
      console.error("Signup error:", err);
    }
    return NextResponse.json(
      {
        error: "Internal server error, If you are using a demo account, you can still log in using your credentials.",
        message: "If you are using a demo account, you can still log in using your credentials.",
      },
      { status: 500 }
    );
  }
}
