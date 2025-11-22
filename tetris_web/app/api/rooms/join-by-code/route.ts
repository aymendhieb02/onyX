import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated user, but allow guest access
    const user = await verifyToken(request);

    const { roomCode } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
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

    // If user is authenticated, check if already in room
    if (user) {
      const existingPlayer = room.players.find((p) => p.userId === user.id);
      if (existingPlayer) {
        const roomResponse = {
          ...room,
          settings: JSON.parse(room.settings),
        };
        return NextResponse.json({ room: roomResponse }, { status: 200 });
      }

      // Add authenticated player to room
      await prisma.roomPlayer.create({
        data: {
          userId: user.id,
          username: user.username,
          avatar: user.avatar || null,
          ready: false,
          score: 0,
          lines: 0,
          status: "alive",
          roomId: room.id,
        },
      });
    } else {
      // Guest access - return room info but require guest name
      return NextResponse.json(
        { 
          error: "Authentication required or use guest join",
          roomCode: room.roomCode,
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const updatedRoom = await prisma.room.findUnique({
      where: { id: room.id },
      include: { players: true },
    });

    const roomResponse = {
      ...updatedRoom,
      settings: JSON.parse(updatedRoom!.settings),
    };

    return NextResponse.json({ room: roomResponse }, { status: 200 });
  } catch (error) {
    console.error("Failed to join room by code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

