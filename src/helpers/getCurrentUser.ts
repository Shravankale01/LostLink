import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Removed the unused import of NextRequest

export function getCurrentUserId(): string | null {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);

    // Instead of using any, define a properly typed decoded type or use 'unknown' and narrow it:
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
    // Unused error param fixed by removing param name
    return null;
  }
}
