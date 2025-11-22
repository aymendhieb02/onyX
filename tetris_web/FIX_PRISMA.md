# Fix Prisma Client Issue

The Prisma client is out of sync with the schema. The `roomCode` field was added to the schema but the client wasn't regenerated.

## Solution

**Stop the dev server first** (Ctrl+C in the terminal running `npm run dev`), then run:

```bash
cd tetris_web
npx prisma generate
```

Then restart the dev server:

```bash
npm run dev
```

## Why this happened

The migration was created but the Prisma client wasn't regenerated. The dev server was holding the Prisma client files, preventing regeneration.

## Alternative: Reset database (if needed)

If you don't have important data:

```bash
npx prisma migrate reset
npx prisma generate
```

This will:
1. Drop the database
2. Recreate it
3. Apply all migrations
4. Regenerate the Prisma client

