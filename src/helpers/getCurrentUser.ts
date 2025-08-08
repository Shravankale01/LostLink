import { cookies } from "next/headers";

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getCurrentUserId(): string | null {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRETKEY!);
    return (decoded as any).id;
  } catch (error) {
    return null;
  }
}