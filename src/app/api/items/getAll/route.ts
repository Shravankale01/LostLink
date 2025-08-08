import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function GET() {
  try {
    await connect();

    const items = await Item.find({
      isApproved: true,
      status: { $nin: ["returned", "closed"] }, // Exclude returned & closed
    }).sort({ createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
