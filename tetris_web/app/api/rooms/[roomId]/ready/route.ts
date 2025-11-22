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

    const player = room.players.find((p) => p.userId === user.id);
    if (!player) {
      return NextResponse.json({ error: "Player not in room" }, { status: 400 });
    }

    // Toggle ready status
    await prisma.roomPlayer.update({
      where: { id: player.id },
      data: { ready: !player.ready },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { players: true },
    });

    return NextResponse.json({ room: updatedRoom }, { status: 200 });
  } catch (error) {
    console.error("Failed to toggle ready:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

