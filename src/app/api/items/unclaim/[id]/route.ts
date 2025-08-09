import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import mongoose from "mongoose";

// PATCH /api/items/unclaim/[id]
export async function PATCH(req: NextRequest, context: any) {
  // Cast context to the expected type
  const { params } = context as { params: { id: string } };
  const { id } = params;

  await connectDB();

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  // Fetch item
  const item = await Item.findById(id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Only update existing fields
  item.status = "found";
  item.isClaimed = false;
  item.claimedBy = null;

  await item.save();

  return NextResponse.json(
    { message: "Item status set to found and unclaimed." },
    { status: 200 }
  );
}
