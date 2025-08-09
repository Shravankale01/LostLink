import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      typeof (decoded as { id?: unknown }).id === "string"
    ) {
      return (decoded as { id: string }).id;
    }

    return null;
  } catch {
    return null;
  }
}
