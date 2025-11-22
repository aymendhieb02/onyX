import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const defaultStats = {
      totalScore: 0,
      totalLines: 0,
      totalGames: 0,
      wins: 0,
      losses: 0,
      highestLevel: 1,
      coins: 100, // Starting coins
      xp: 0,
      level: 1,
      rank: "Beginner",
    };

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        stats: JSON.stringify(defaultStats),
        completedLevels: JSON.stringify([]),
        unlockedThemes: JSON.stringify([]),
        achievements: JSON.stringify([]),
      },
    });

    // Return user without password, parse JSON fields
    const { password: _, ...userWithoutPassword } = user;
    const userResponse = {
      ...userWithoutPassword,
      stats: JSON.parse(user.stats),
      completedLevels: JSON.parse(user.completedLevels),
      unlockedThemes: JSON.parse(user.unlockedThemes),
      achievements: JSON.parse(user.achievements),
    };

    return NextResponse.json(
      { user: userResponse, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

