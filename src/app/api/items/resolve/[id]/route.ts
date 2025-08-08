export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const userId = await getDataFromToken(req);
  const itemId = params.id;
  const { status } = await req.json(); // "returned" or "closed"

  if (!["returned", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  item.status = status;
  await item.save();

  return NextResponse.json({ message: `Item marked as ${status}`, item });
}
