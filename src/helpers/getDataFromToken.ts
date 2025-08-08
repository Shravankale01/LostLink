import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken = async (req: NextRequest): Promise<string | null> => {
  try {
    const headersList = req.headers;
    const cookie = headersList.get("cookie") || "";
    const token = cookie.split("token=")[1]?.split(";")[0];

    if (!token) return null;

    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRETKEY!);
    return decoded.id;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};
