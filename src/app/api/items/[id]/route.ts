import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import mongoose from "mongoose";

// Correct GET signature for Next.js API handler
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching item:", error);

    let message = "Internal Server Error";
    if (error instanceof Error) message = error.message;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
