import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { roomCode, guestName } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    if (!guestName || guestName.trim().length < 2) {
      return NextResponse.json(
        { error: "Guest name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Find room by code
    const room = await prisma.room.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
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

    // Create guest player (no user account needed)
    // userId is null for guest players
    const guestPlayer = await prisma.roomPlayer.create({
      data: {
        userId: null, // Null for guest players
        username: guestName.trim(),
        avatar: null,
        ready: false,
        score: 0,
        lines: 0,
        status: "alive",
        isGuest: true,
        roomId: room.id,
      },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: { players: true },
    });

    const roomResponse = {
      ...updatedRoom,
      settings: JSON.parse(updatedRoom!.settings),
    };

    return NextResponse.json({ 
      room: roomResponse,
      guestPlayerId: guestPlayer.id,
      isGuest: true,
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to join room as guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

