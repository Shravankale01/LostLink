import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import Chat from "@/models/chatModel";

export async function PATCH(req: NextRequest, context: any) {
  // Cast context to expected type
  const { params } = context as { params: { id: string } };
  const itemId = params.id;

  try {
    await connectDB();

    const userId = await getDataFromToken(req);

    console.log("Claiming item:", itemId);
    console.log("User ID from token:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await Item.findById(itemId);

    if (!item || item.status === "claimed") {
      return NextResponse.json(
        { error: "Item already claimed or not found" },
        { status: 400 }
      );
    }

    item.status = "claimed";
    item.isClaimed = true;
    item.claimedBy = userId;

    await item.save();

    // Create chat if not exists - include required `sender` field
    const existingChat = await Chat.findOne({
      item: itemId,
      participants: { $all: [item.createdBy, userId] },
    });

    if (!existingChat) {
      await Chat.create({
        item: itemId,
        participants: [item.createdBy, userId],
        sender: userId, // REQUIRED field added here
        messages: [], // Initialize if your schema requires it
      });
    }

    return NextResponse.json({ success: true, item }, { status: 200 });
  } catch (error: unknown) {
    console.error("Claim item error:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
