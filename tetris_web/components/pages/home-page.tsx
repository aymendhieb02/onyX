"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/game/game-board";
import { GameHUD } from "@/components/game/game-hud";
import { GameControls } from "@/components/game/game-controls";
import { LineClearAnimation } from "@/components/game/line-clear-animation";
import { Avatar3D } from "@/components/animations/avatar-3d";
import { MainMenu } from "@/components/menu/main-menu";
import { GameOverScreen } from "@/components/menu/game-over-screen";
import { ChatAssistant } from "@/components/chat/chat-assistant";
import { RoomCodeJoin } from "@/components/multiplayer/room-code-join";
import { RoomCreated } from "@/components/multiplayer/room-created";
import { MultiplayerLobby } from "@/components/multiplayer/multiplayer-lobby";
import { MultiplayerGameScreen } from "@/components/multiplayer/multiplayer-game-screen";
import { GameEngine } from "@/lib/game/engine";
import { GameState, GameMode } from "@/lib/game/types";
import { Room } from "@/lib/types/user";

interface HomePageProps {
  user?: any;
}

type ViewState = "menu" | "single-player" | "multiplayer-join" | "multiplayer-created" | "multiplayer-lobby" | "multiplayer-game";

export function HomePage({ user }: HomePageProps) {
  const [engine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [viewState, setViewState] = useState<ViewState>("menu");
  const [showChat, setShowChat] = useState(false);
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [showLineAnimation, setShowLineAnimation] = useState(false);
  const [show3DAvatar, setShow3DAvatar] = useState(false);
  const [avatarLines, setAvatarLines] = useState(0);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string>("");

  useEffect(() => {
    engine.onStateChange = (state) => setGameState(state);
    engine.onStatsChange = () => {
      // Trigger re-render for stats
      setGameState(engine.state);
    };
    engine.onLinesClear = (lines) => {
      setClearedLines(lines);
      setShowLineAnimation(true);
      
      // Show 3D avatar for 4+ line clears
      if (lines.length >= 4) {
        setAvatarLines(lines.length);
        setShow3DAvatar(true);
      }
    };

    // Game loop
    let lastTime = Date.now();
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      if (engine.state === GameState.PLAYING) {
        engine.update(deltaTime);
      }

      requestAnimationFrame(gameLoop);
    };
    gameLoop();

    // Keyboard controls
    const handleKeyPress = (e: KeyboardEvent) => {
      if (engine.state !== GameState.PLAYING) return;

      switch (e.key) {
        case "ArrowLeft":
          engine.moveLeft();
          break;
        case "ArrowRight":
          engine.moveRight();
          break;
        case "ArrowDown":
          engine.isSoftDropping = true;
          break;
        case "ArrowUp":
        case "x":
        case "X":
          engine.rotate();
          break;
        case "z":
        case "Z":
          engine.rotateBack();
          break;
        case " ":
          e.preventDefault();
          engine.hardDrop();
          break;
        case "c":
        case "C":
          engine.hold();
          break;
        case "Escape":
          engine.pause();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        engine.isSoftDropping = false;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine]);

  const handleStartGame = (mode: GameMode) => {
    setViewState("single-player");
    engine.start(mode);
  };

  const handleRestart = () => {
    engine.reset();
    setGameState(GameState.MENU);
    setViewState("menu");
  };

  const handleMultiplayer = () => {
    setViewState("multiplayer-join");
  };

  const handleCreateRoom = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login?redirect=/";
      return;
    }

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({
          name: `${user?.username}'s Room`,
          maxPlayers: 4,
          gameMode: "classic",
        }),
      });

      if (response.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = "/login?redirect=/";
        return;
      }

      const data = await response.json();
      if (data.room) {
        setCreatedRoomCode(data.room.roomCode);
        setCurrentRoom(data.room);
        setViewState("multiplayer-created");
      } else if (data.error) {
        console.error("Failed to create room:", data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  const handleJoinRoomByCode = async (roomId: string) => {
    // Room already joined via join-by-code endpoint
    // Just fetch the room details and go to lobby
    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      const data = await response.json();
      if (data.room) {
        setCurrentRoom(data.room);
        setViewState("multiplayer-lobby");
      }
    } catch (error) {
      console.error("Failed to fetch room:", error);
    }
  };

  const handleGoToLobby = () => {
    if (currentRoom) {
      setViewState("multiplayer-lobby");
    }
  };

  const handleStartMultiplayerGame = () => {
    if (currentRoom) {
      setViewState("multiplayer-game");
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setViewState("multiplayer-rooms");
    setPlayerReady(false);
  };

  const handleToggleReady = () => {
    setPlayerReady(!playerReady);
  };

  const handleMultiplayerGameEnd = (results: any) => {
    // Handle game end, show results
    setViewState("multiplayer-rooms");
    setCurrentRoom(null);
  };

  return (
    <div className="min-h-screen animated-bg grid-pattern relative overflow-hidden">
      {/* Main Menu */}
      {viewState === "menu" && (
        <MainMenu 
          onStartGame={handleStartGame} 
          onMultiplayer={handleMultiplayer}
          onCreateRoom={handleCreateRoom}
          user={user}
        />
      )}

      {/* Multiplayer Join by Code */}
      {viewState === "multiplayer-join" && (
        <RoomCodeJoin
          onJoinRoom={handleJoinRoomByCode}
          onBack={() => setViewState("menu")}
        />
      )}

      {/* Room Created - Show Code */}
      {viewState === "multiplayer-created" && currentRoom && (
        <RoomCreated
          roomCode={createdRoomCode}
          roomName={currentRoom.name}
          roomId={currentRoom.id}
          onBack={() => setViewState("menu")}
        />
      )}

      {/* Multiplayer Lobby */}
      {viewState === "multiplayer-lobby" && currentRoom && (
        <MultiplayerLobby
          room={currentRoom}
          currentUserId={user?.id || ""}
          onStartGame={handleStartMultiplayerGame}
          onLeaveRoom={handleLeaveRoom}
          onToggleReady={handleToggleReady}
        />
      )}

      {/* Multiplayer Game */}
      {viewState === "multiplayer-game" && currentRoom && (
        <MultiplayerGameScreen
          room={currentRoom}
          currentUserId={user?.id || ""}
          onGameEnd={handleMultiplayerGameEnd}
          onLeave={handleLeaveRoom}
        />
      )}

      {/* Single Player Game */}
      {viewState === "single-player" && gameState === GameState.PLAYING && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Game Board */}
            <div className="flex-shrink-0">
              <GameBoard engine={engine} />
            </div>

            {/* Side Panel */}
            <div className="flex flex-col gap-6 w-full lg:w-80">
              <GameHUD engine={engine} />
              <GameControls />
            </div>
          </div>
          
          {/* Line Clear Animation */}
          {showLineAnimation && (
            <LineClearAnimation
              lines={clearedLines}
              onComplete={() => {
                setShowLineAnimation(false);
                setClearedLines([]);
              }}
            />
          )}
        </div>
      )}

      {/* 3D Avatar Animation */}
      {show3DAvatar && (
        <Avatar3D
          show={show3DAvatar}
          linesCleared={avatarLines}
          onComplete={() => setShow3DAvatar(false)}
        />
      )}

      {gameState === GameState.PAUSED && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-blue-500/50 rounded-lg p-8 glow-effect">
            <h2 className="text-3xl font-bold text-white mb-4 neon-text text-blue-400">
              Game Paused
            </h2>
            <p className="text-slate-400 mb-6">Press ESC to resume</p>
            <button
              onClick={() => engine.resume()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <GameOverScreen engine={engine} onRestart={handleRestart} />
      )}

      {/* Chat Assistant Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg glow-effect transition-all z-40"
        aria-label="Toggle chat assistant"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Assistant */}
      {showChat && (
        <ChatAssistant onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

