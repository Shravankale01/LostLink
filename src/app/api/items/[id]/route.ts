
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import mongoose from "mongoose";

// DO NOT await `context` — just access params directly
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = context.params;  // ✔️ Just use context.params, no await

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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

