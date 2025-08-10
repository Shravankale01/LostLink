// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import Item from "@/models/itemModel";
// import jwt, { JwtPayload } from "jsonwebtoken";

// export async function GET(req: Request) {
//   await connectDB();

//   // 1. Read token from cookie
//   const token = req.headers.get("cookie")
//     ?.split("; ")
//     .find(row => row.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // 2. Decode user info from token
//   let decoded: string | JwtPayload;
//   try {
//     decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);
//   } catch {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // 3. Ensure decoded is an object with 'id'
//   if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
//     return NextResponse.json({ error: "Invalid token data" }, { status: 401 });
//   }

//   const userId = (decoded as JwtPayload).id;

//   const items = await Item.find({ createdBy: userId })
//     .populate("claimedBy", "username email _id") // adjust as needed
//     .lean();

//   return NextResponse.json({ items }, { status: 200 });
// }

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  // 1. Read token from cookie
  const token = req.headers.get("cookie")
    ?.split("; ")
    .find(row => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Decode user info from token
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (typeof decoded === "string" || !decoded || !("id" in decoded)) {
    return NextResponse.json({ error: "Invalid token data" }, { status: 401 });
  }

  const userId = (decoded as JwtPayload).id;

  let items = await Item.find({ createdBy: userId })
    .populate("claimedBy", "username email _id")
    .lean();

  // 🔹 Add imageUrl as base64 data URL
  items = items.map(item => {
    if (item.image && item.imageContentType) {
      const base64Image = item.image.toString("base64");
      item.imageUrl = `data:${item.imageContentType};base64,${base64Image}`;
    } else {
      item.imageUrl = null;
    }
    return item;
  });

  return NextResponse.json({ items }, { status: 200 });
}
