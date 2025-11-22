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

    const { score, lines } = await request.json();

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

    // Mark player as eliminated
    await prisma.roomPlayer.update({
      where: { id: player.id },
      data: {
        status: "eliminated",
        score,
        lines,
      },
    });

    // Check if all players are eliminated (game over)
    const updatedRoom = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { players: true },
    });

    const alivePlayers = updatedRoom?.players.filter((p) => p.status === "alive") || [];
    
    if (alivePlayers.length === 0) {
      // All players eliminated, game over
      const winner = updatedRoom?.players.sort((a, b) => b.score - a.score)[0];
      
      await prisma.room.update({
        where: { id: params.roomId },
        data: { status: "finished" },
      });

      await prisma.gameSession.create({
        data: {
          roomId: params.roomId,
          winner: winner?.userId || null,
          results: JSON.stringify({
            players: updatedRoom?.players.map((p) => ({
              userId: p.userId,
              username: p.username,
              score: p.score,
              lines: p.lines,
            })),
          }),
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to report game over:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

