import { NextRequest, NextResponse } from "next/server";
// Removed unused 'connect' import
import Item from "@/models/itemModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { writeFile } from "fs/promises";
import path from "path";
import connectDB from "@/lib/db";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get current user's ID
    const userId = await getDataFromToken(req); 

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const status = formData.get("status") as string;
    const image = formData.get("image") as File | null;

    let imageUrl = "";

    if (image && image.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const extension = path.extname(image.name);
      const filename = `${timestamp}${extension}`;
      const filepath = path.join(uploadsDir, filename);

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      imageUrl = `/uploads/${filename}`;
    }

    const newItem = new Item({
      title,
      description,
      location,
      imageUrl,
      createdBy: userId,
      status: status || "lost",
    });

    await newItem.save();

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: unknown) {
    console.error("Add item error:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
