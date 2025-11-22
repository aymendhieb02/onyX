import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { generateRoomCode } from "@/lib/utils/room-code";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, maxPlayers = 4, gameMode = "classic", settings } = await request.json();

    const defaultSettings = {
      speed: 1000,
      garbageLines: true,
      powerUps: false,
    };

    // Generate unique room code
    let roomCode: string;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      roomCode = generateRoomCode();
      const existing = await prisma.room.findUnique({
        where: { roomCode },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Failed to generate unique room code" },
        { status: 500 }
      );
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: name || `${user.username}'s Room`,
        roomCode: roomCode!,
        hostId: user.id,
        hostUsername: user.username,
        maxPlayers,
        gameMode,
        status: "waiting",
        settings: JSON.stringify(settings || defaultSettings),
        players: {
          create: {
            userId: user.id,
            username: user.username,
            avatar: user.avatar || null,
            ready: false,
            score: 0,
            lines: 0,
            status: "alive",
          },
        },
      },
      include: {
        players: true,
      },
    });

    // Parse settings JSON
    const roomResponse = {
      ...room,
      settings: JSON.parse(room.settings),
    };

    return NextResponse.json({ room: roomResponse }, { status: 201 });
  } catch (error) {
    console.error("Room creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

