import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Chat from "@/models/chatModel";
import User from "@/models/userModels";
import Item from "@/models/itemModel";
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

const getAdminUser = async () => {
  return await User.findOne({ isAdmin: true });
};

// GET messages
export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    await connectDB();
    const userId = await getDataFromToken(req);
    const { itemId } = params;

    const item = await Item.findById(itemId);
    if (!item || !item.claimedBy)
      return NextResponse.json({ error: "Item not claimed" }, { status: 400 });

    const admin = await getAdminUser();
    const isAllowed =
      userId === item.claimedBy.toString() || userId === admin?._id.toString();
    if (!isAllowed)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chats = await Chat.find({
      item: item._id,
      participants: { $all: [item.claimedBy, admin!._id] },
    })
      .populate("participants", "username email")
      .populate("sender", "username email")
      .populate("item", "title")
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages: chats }, { status: 200 });
  } catch (error: unknown) {
    console.error("Chat fetch error:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST message
export async function POST(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    await connectDB();
    const userId = await getDataFromToken(req);
    const { itemId } = params;

    const item = await Item.findById(itemId);
    if (!item || !item.claimedBy)
      return NextResponse.json({ error: "Item not claimed" }, { status: 400 });

    const admin = await getAdminUser();
    const isAllowed =
      userId === item.claimedBy.toString() || userId === admin?._id.toString();
    if (!isAllowed)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const text = formData.get("text")?.toString() || "";
    const fileData = formData.get("file");

    let fileUrl: string | null = null;

    if (
      fileData &&
      typeof fileData === "object" &&
      "size" in fileData &&
      (fileData as File).size > 0
    ) {
      const file = fileData as File;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name}`;
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      fileUrl = `/uploads/${filename}`;
    }

    const participants = [item.claimedBy, admin!._id];

    const newChat = new Chat({
      item: item._id,
      sender: userId,
      participants,
      text,
      file: fileUrl,
    });

    await newChat.save();

    const populatedChat = await Chat.findById(newChat._id)
      .populate("participants", "username email")
      .populate("sender", "username email")
      .populate("item", "title");

    return NextResponse.json({ message: populatedChat }, { status: 201 });
  } catch (error: unknown) {
    console.error("Chat post error:", error);
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
