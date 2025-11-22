import 'dart:async';
import 'dart:math';
import 'tetromino.dart';
import 'game_board.dart';

enum GameState { waiting, playing, paused, gameOver }

class GameEngine {
  final GameBoard board;
  Tetromino? currentPiece;
  Tetromino? nextPiece;
  List<Tetromino> nextPiecesQueue = [];
  int currentX = 0;
  int currentY = 0;
  int score = 0;
  int level = 1;
  int linesCleared = 0;
  GameState state = GameState.waiting;
  Timer? gameTimer;
  double fallSpeed = 1000.0; // milliseconds
  bool isSoftDropping = false;
  bool isHardDropping = false;

  // Callbacks
  Function()? onScoreChanged;
  Function()? onLevelChanged;
  Function()? onLinesCleared;
  Function(List<int>)? onLinesClearedAnimation;
  Function()? onGameOver;
  Function()? onPiecePlaced;
  Function()? onStateChanged;

  GameEngine({required this.board}) {
    _initializeNextPieces();
  }

  void _initializeNextPieces() {
    nextPiecesQueue = List.generate(3, (_) => Tetromino.random());
    nextPiece = nextPiecesQueue.removeAt(0);
  }

  void start() {
    if (state == GameState.playing) return;

    state = GameState.playing;
    onStateChanged?.call();
    _spawnNewPiece();
    _startGameLoop();
  }

  void pause() {
    if (state != GameState.playing) return;
    state = GameState.paused;
    gameTimer?.cancel();
    onStateChanged?.call();
  }

  void resume() {
    if (state != GameState.paused) return;
    state = GameState.playing;
    onStateChanged?.call();
    _startGameLoop();
  }

  void _startGameLoop() {
    gameTimer?.cancel();
    final speed = isSoftDropping ? fallSpeed / 10 : fallSpeed;
    gameTimer = Timer.periodic(Duration(milliseconds: speed.toInt()), (_) {
      if (state == GameState.playing) {
        _moveDown();
      }
    });
  }

  void restartGameLoop() {
    _startGameLoop();
  }

  void _spawnNewPiece() {
    if (nextPiece == null) {
      _initializeNextPieces();
    }

    currentPiece = nextPiece;
    nextPiece = nextPiecesQueue.isEmpty
        ? Tetromino.random()
        : nextPiecesQueue.removeAt(0);
    nextPiecesQueue.add(Tetromino.random());

    currentX = (GameBoard.width - currentPiece!.currentShape[0].length) ~/ 2;
    currentY = 0;

    if (!board.isValidPosition(currentPiece!, currentX, currentY)) {
      _gameOver();
    }
  }

  void _moveDown() {
    if (currentPiece == null) return;

    if (board.isValidPosition(currentPiece!, currentX, currentY + 1)) {
      currentY++;
      onStateChanged?.call();
    } else {
      _placePiece();
    }
  }

  void _placePiece() {
    if (currentPiece == null) return;

    board.placeTetromino(currentPiece!, currentX, currentY);
    onPiecePlaced?.call();

    final clearedLines = board.clearLines();
    if (clearedLines.isNotEmpty) {
      linesCleared += clearedLines.length;
      _updateScore(clearedLines.length);
      _updateLevel();
      onLinesClearedAnimation?.call(clearedLines);
      onLinesCleared?.call();
    }

    if (board.isGameOver()) {
      _gameOver();
    } else {
      _spawnNewPiece();
    }
  }

  void moveLeft() {
    if (currentPiece == null || state != GameState.playing) return;
    if (board.isValidPosition(currentPiece!, currentX - 1, currentY)) {
      currentX--;
      onStateChanged?.call();
    }
  }

  void moveRight() {
    if (currentPiece == null || state != GameState.playing) return;
    if (board.isValidPosition(currentPiece!, currentX + 1, currentY)) {
      currentX++;
      onStateChanged?.call();
    }
  }

  void rotate() {
    if (currentPiece == null || state != GameState.playing) return;
    final testPiece = currentPiece!.copy();
    testPiece.rotate();
    if (board.isValidPosition(testPiece, currentX, currentY)) {
      currentPiece!.rotate();
      onStateChanged?.call();
    } else {
      // Try wall kicks
      for (int offset in [-1, 1, -2, 2]) {
        if (board.isValidPosition(testPiece, currentX + offset, currentY)) {
          currentX += offset;
          currentPiece!.rotate();
          onStateChanged?.call();
          return;
        }
      }
    }
  }

  void softDrop() {
    if (state != GameState.playing) return;
    isSoftDropping = true;
    _startGameLoop();
    _moveDown();
  }

  void stopSoftDrop() {
    isSoftDropping = false;
    _startGameLoop();
  }

  void hardDrop() {
    if (currentPiece == null || state != GameState.playing) return;
    isHardDropping = true;
    int dropDistance = 0;
    while (board.isValidPosition(currentPiece!, currentX, currentY + 1)) {
      currentY++;
      dropDistance++;
    }
    score += dropDistance * 5; // Bonus points for hard drop
    onScoreChanged?.call();
    _placePiece();
    isHardDropping = false;
  }

  void _updateScore(int linesClearedCount) {
    int points = 0;
    switch (linesClearedCount) {
      case 1:
        points = 100 * level;
        break;
      case 2:
        points = 300 * level;
        break;
      case 3:
        points = 500 * level;
        break;
      case 4:
        points = 800 * level;
        break;
    }
    score += points;
    onScoreChanged?.call();
  }

  void _updateLevel() {
    final newLevel = (linesCleared ~/ 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      fallSpeed = max(50.0, 1000.0 - (level - 1) * 50.0);
      _startGameLoop();
      onLevelChanged?.call();
    }
  }

  void _gameOver() {
    state = GameState.gameOver;
    gameTimer?.cancel();
    onGameOver?.call();
    onStateChanged?.call();
  }

  void reset() {
    gameTimer?.cancel();
    board.reset();
    score = 0;
    level = 1;
    linesCleared = 0;
    currentPiece = null;
    currentX = 0;
    currentY = 0;
    state = GameState.waiting;
    fallSpeed = 1000.0;
    isSoftDropping = false;
    isHardDropping = false;
    _initializeNextPieces();
    onStateChanged?.call();
  }

  void dispose() {
    gameTimer?.cancel();
  }
}

