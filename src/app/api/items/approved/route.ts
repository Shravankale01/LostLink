// import { NextResponse } from "next/server";
// import { connect } from "@/dbConfig/dbConfig";
// import Item from "@/models/itemModel";

// export async function GET() {
//   try {
//     await connect();

//     const approvedItems = await Item.find({ isApproved: true })
//       .sort({ createdAt: -1 })
//       .populate("claimedBy", "username"); // Get claimer's username

//     return NextResponse.json({ items: approvedItems });
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

    let approvedItems = await Item.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .populate("claimedBy", "username") // Get claimer's username
      .lean(); // Make it plain JS objects for modification

    // 🔹 Convert binary images to Base64 data URLs
    approvedItems = approvedItems.map(item => {
      if (item.image && item.imageContentType) {
        const base64Image = item.image.toString("base64");
        item.imageUrl = `data:${item.imageContentType};base64,${base64Image}`;
      } else {
        item.imageUrl = null;
      }
      return item;
    });

    return NextResponse.json({ items: approvedItems });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


