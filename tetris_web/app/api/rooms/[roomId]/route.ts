import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    // Allow both authenticated users and guests to view rooms
    const user = await verifyToken(request);

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: {
        players: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Parse settings JSON
    const roomResponse = {
      ...room,
      settings: JSON.parse(room.settings),
    };

    return NextResponse.json({ room: roomResponse }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only host can update room status
    if (room.hostId !== user.id) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      );
    }

    // Check if at least one non-host player is ready
    const nonHostPlayers = room.players.filter((p) => p.userId !== room.hostId);
    const atLeastOneReady = nonHostPlayers.length > 0 && nonHostPlayers.some((p) => p.ready);

    if (status === "playing" && !atLeastOneReady) {
      return NextResponse.json(
        { error: "At least one player must be ready to start" },
        { status: 400 }
      );
    }

    // Update room status
    const updatedRoom = await prisma.room.update({
      where: { id: params.roomId },
      data: { status },
      include: { players: true },
    });

    const roomResponse = {
      ...updatedRoom,
      settings: JSON.parse(updatedRoom.settings),
    };

    return NextResponse.json({ room: roomResponse }, { status: 200 });
  } catch (error) {
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

