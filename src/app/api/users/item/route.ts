// GET /api/users/items 
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  // 1. Read token from cookie
  const token = req.headers.get('cookie')
    ?.split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Decode user info from token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

 

  const items = await Item.find({ createdBy: decoded.id })
    .populate("claimedBy", "username email _id") // adjust as needed for your mongoose schema
    .lean();


  return NextResponse.json({ items }, { status: 200 });
}
