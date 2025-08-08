import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function GET() {
  try {
    await connect();

    const approvedItems = await Item.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate("claimedBy", "username"); // Get claimer's username

    return NextResponse.json({ items: approvedItems });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

