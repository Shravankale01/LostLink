import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const approvedItems = await Item.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate("claimedBy", "username"); // ✅ Get claimer's username

    return NextResponse.json({ items: approvedItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
