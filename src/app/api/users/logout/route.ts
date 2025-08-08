import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  // Remove the token cookie by setting it to empty and expiring it
  response.cookies.set("token", "", { httpOnly: true, expires: new Date(0) });
  return response;
}

