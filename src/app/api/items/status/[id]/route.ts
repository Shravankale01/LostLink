import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function PATCH(req: NextRequest, context: any) {
  const { params } = context as { params: { id: string } };
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
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
