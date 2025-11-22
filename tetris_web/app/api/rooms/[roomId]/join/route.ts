import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Room is not accepting players" },
        { status: 400 }
      );
    }

    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      );
    }

    // Check if user is already in room
    const existingPlayer = room.players.find((p) => p.userId === user.id);
    if (existingPlayer) {
      return NextResponse.json({ room }, { status: 200 });
    }

    // Add player to room
    await prisma.roomPlayer.create({
      data: {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        ready: false,
        score: 0,
        lines: 0,
        status: "alive",
        roomId: room.id,
      },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { players: true },
    });

    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error("Failed to join room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

