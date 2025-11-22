# Setup Guide

Complete setup instructions for Tetris Pro with all features.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- SQLite (included with Prisma)

## Installation Steps

### 1. Install Dependencies

```bash
cd tetris_web
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (change in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Next.js
NODE_ENV="development"

# Socket.io (for real-time multiplayer)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Setup

### Authentication

The app includes:
- User registration
- User login
- JWT-based authentication
- Protected API routes

### Database Schema

The Prisma schema includes:
- Users with stats and achievements
- Rooms for multiplayer
- Room players
- Game sessions

### Multiplayer

For real-time multiplayer, you'll need to set up WebSocket server (Socket.io). This is currently using API routes but can be extended.

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Set Production Environment Variables

Update `.env` with production values:
- Use a production database (PostgreSQL recommended)
- Set a strong `JWT_SECRET`
- Set `NODE_ENV="production"`

### 3. Run Migrations

```bash
npx prisma migrate deploy
```

### 4. Start Production Server

```bash
npm start
```

## Troubleshooting

### Database Issues

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

### Port Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit
```

### Missing Dependencies

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

## Next Steps

1. Create your first account
2. Explore the levels system
3. Create a multiplayer room
4. Complete missions and achievements
5. Climb the leaderboards!

## Support

For issues or questions, check:
- [README.md](./README.md) - Project overview
- [USER_GUIDE.md](./USER_GUIDE.md) - Gameplay guide
- [API_DOCS.md](./API_DOCS.md) - API documentation

