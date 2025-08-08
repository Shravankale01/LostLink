import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Item from "@/models/itemModel";
import User from "@/models/userModels";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const userId = await getDataFromToken(req);
    console.log("Admin ID:", userId);

    const user = await User.findById(userId);
    console.log("Admin:", user);

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const items = await Item.find({ isApproved: false });
    console.log("Unapproved Items:", items);

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("❌ Error in GET /api/items/unapproved:", err.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
