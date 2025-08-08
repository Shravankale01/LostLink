import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  try {
    const { status } = await req.json();

    const updatedItem = await Item.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated", item: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
