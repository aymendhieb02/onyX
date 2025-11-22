-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_room_players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "lines" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'alive',
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "room_players_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "room_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_room_players" ("avatar", "id", "isGuest", "lines", "ready", "roomId", "score", "status", "userId", "username") SELECT "avatar", "id", "isGuest", "lines", "ready", "roomId", "score", "status", "userId", "username" FROM "room_players";
DROP TABLE "room_players";
ALTER TABLE "new_room_players" RENAME TO "room_players";
CREATE INDEX "room_players_roomId_idx" ON "room_players"("roomId");
CREATE INDEX "room_players_userId_idx" ON "room_players"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
