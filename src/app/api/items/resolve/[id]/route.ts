import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";

export async function PATCH(req: NextRequest, { params }) {
  await connectDB();
  
  const itemId = params.id;
  const { status } = await req.json(); // "returned" or "closed"

  if (!["returned", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  item.status = status;
  await item.save();

  return NextResponse.json({ message: `Item marked as ${status}`, item });
}

