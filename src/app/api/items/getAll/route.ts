// import { NextResponse } from "next/server";
// import { connect } from "@/dbConfig/dbConfig";
// import Item from "@/models/itemModel";

// export async function GET() {
//   try {
//     await connect();

//     const items = await Item.find({
//       isApproved: true,
//       status: { $nin: ["returned", "closed"] }, // Exclude returned & closed
//     }).sort({ createdAt: -1 });

//     return NextResponse.json({ items });
//   } catch (error: unknown) {
//     let errorMessage = "An unknown error occurred";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Item from "@/models/itemModel";

export async function GET() {
  try {
    await connect();

    let items = await Item.find({
      isApproved: true,
      status: { $nin: ["returned", "closed"] }, // Exclude returned & closed
    })
      .sort({ createdAt: -1 })
      .lean();

    // 🔹 Convert image binary data to base64 data URLs
    items = items.map(item => {
      if (item.image && item.imageContentType) {
        const base64Image = item.image.toString("base64");
        item.imageUrl = `data:${item.imageContentType};base64,${base64Image}`;
      } else {
        item.imageUrl = null;
      }
      return item;
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
