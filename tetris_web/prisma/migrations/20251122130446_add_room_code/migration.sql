/*
  Warnings:

  - Added the required column `roomCode` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "hostUsername" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "gameMode" TEXT NOT NULL DEFAULT 'classic',
    "settings" TEXT NOT NULL DEFAULT '{"speed":1000,"garbageLines":true,"powerUps":false}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rooms" ("createdAt", "gameMode", "hostId", "hostUsername", "id", "maxPlayers", "name", "settings", "status") SELECT "createdAt", "gameMode", "hostId", "hostUsername", "id", "maxPlayers", "name", "settings", "status" FROM "rooms";
DROP TABLE "rooms";
ALTER TABLE "new_rooms" RENAME TO "rooms";
CREATE UNIQUE INDEX "rooms_roomCode_key" ON "rooms"("roomCode");
CREATE INDEX "rooms_roomCode_idx" ON "rooms"("roomCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
