import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function verifyToken(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from Authorization header
    const token = 
      request.cookies.get("auth-token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.headers.get("cookie")?.split("auth-token=")[1]?.split(";")[0];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        stats: true,
        completedLevels: true,
        unlockedThemes: true,
        achievements: true,
      },
    });

    if (!user) return null;

    // Parse JSON fields
    return {
      ...user,
      stats: JSON.parse(user.stats),
      completedLevels: JSON.parse(user.completedLevels),
      unlockedThemes: JSON.parse(user.unlockedThemes),
      achievements: JSON.parse(user.achievements),
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

