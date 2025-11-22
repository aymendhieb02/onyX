import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Find the player
    const player = await prisma.roomPlayer.findUnique({
      where: { id: playerId },
    });

    if (!player || player.roomId !== params.roomId) {
      return NextResponse.json(
        { error: "Player not found in room" },
        { status: 404 }
      );
    }

    // Toggle ready status
    const updatedPlayer = await prisma.roomPlayer.update({
      where: { id: playerId },
      data: { ready: !player.ready },
    });

    return NextResponse.json({ player: updatedPlayer }, { status: 200 });
  } catch (error) {
    console.error("Failed to toggle ready for guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

