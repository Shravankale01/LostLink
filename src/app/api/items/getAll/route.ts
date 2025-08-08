// /src/app/api/items/getAll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function GET(req: NextRequest) {
  try {
    await connect();

   const items = await Item.find({
  isApproved: true,
  status: { $nin: ["returned", "closed"] }, // Exclude returned & closed
  }).sort({ createdAt: -1 });



    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
