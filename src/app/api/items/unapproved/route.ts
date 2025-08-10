// import { connect } from "@/dbConfig/dbConfig";
// import { NextRequest, NextResponse } from "next/server";
// import { getDataFromToken } from "@/helpers/getDataFromToken";
// import Item from "@/models/itemModel";
// import User from "@/models/userModels";

// export async function GET(req: NextRequest) {
//   try {
//     await connect();

//     const userId = await getDataFromToken(req);
//     console.log("Admin ID:", userId);

//     const user = await User.findById(userId);
//     console.log("Admin:", user);

//     if (!user || !user.isAdmin) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const items = await Item.find({ isApproved: false });
//     console.log("Unapproved Items:", items);

//     return NextResponse.json({ items });
//   } catch (error: unknown) {
//     let errorMessage = "Internal Server Error";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//       console.error("❌ Error in GET /api/items/unapproved:", errorMessage);
//     }
//     return NextResponse.json(
//       { error: errorMessage },
//       { status: 500 }
//     );
//   }
// }

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

    let items = await Item.find({ isApproved: false }).lean();
    console.log("Unapproved Items:", items);

    // 🔹 Convert binary images to Base64 data URLs
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
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("❌ Error in GET /api/items/unapproved:", errorMessage);
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
