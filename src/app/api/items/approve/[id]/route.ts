import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Item from "@/models/itemModel";
import User from "@/models/userModels";
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const userId = await getDataFromToken(req);
    const itemId = params.id; // ✅ access params here

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      itemId,
      { isApproved: true },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item approved", item: updatedItem });
  } catch (error) {
    console.error("Error approving item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
