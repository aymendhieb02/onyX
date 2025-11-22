import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/tetromino.dart';
import '../core/game_engine.dart';
import '../core/game_board.dart';
import '../providers/game_provider.dart';
import '../providers/theme_provider.dart';
import '../features/motivational_messages.dart';
import '../features/avatars.dart';
import '../features/celebration_effects.dart';
import '../features/music_manager.dart';
import '../modes/adventure_mode.dart';
import '../providers/avatar_provider.dart';
import 'game_over_screen.dart';

class GameScreen extends ConsumerStatefulWidget {
  final GameMode mode;
  final int? level;

  const GameScreen({
    super.key,
    required this.mode,
    this.level,
  });

  @override
  ConsumerState<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends ConsumerState<GameScreen> {
  String? currentMessage;
  bool showLevelTransition = false;
  bool showLevelComplete = false;
  Timer? _gameUpdateTimer;
  DateTime? _lastMoveTime;
  double _lastDragX = 0;
  double _lastDragY = 0;
  bool _isDragging = false;
  int? _targetLines;
  final MusicManager _musicManager = MusicManager();

  @override
  void initState() {
    super.initState();
    _musicManager.initialize();
    _musicManager.playBackgroundMusic();
    _setupGame();
    _startGameUpdateTimer();
  }

  @override
  void dispose() {
    _gameUpdateTimer?.cancel();
    _musicManager.stopBackgroundMusic();
    super.dispose();
  }

  void _startGameUpdateTimer() {
    // Optimized timer for smoother performance
    _gameUpdateTimer = Timer.periodic(const Duration(milliseconds: 33), (_) {
      if (mounted) {
        final engine = ref.read(gameEngineProvider);
        if (engine.state == GameState.playing) {
          setState(() {}); // Force repaint only when playing
        }
      }
    });
  }

  void _setupGame() {
    final engine = ref.read(gameEngineProvider);
    final adventureMode = widget.mode == GameMode.adventure
        ? ref.read(adventureModeProvider)
        : null;

    if (widget.mode == GameMode.adventure && widget.level != null) {
      final levelData = adventureMode?.getLevel(widget.level!);
      if (levelData != null) {
        engine.level = levelData.startingLevel;
        engine.fallSpeed = levelData.fallSpeed;
        _targetLines = levelData.targetLines;
      }
    }

    engine.onScoreChanged = () => setState(() {});
    engine.onLevelChanged = () {
      setState(() {
        showLevelTransition = true;
        currentMessage = MotivationalMessages.getRandomLevelUp();
      });
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            showLevelTransition = false;
          });
        }
      });
    };
    engine.onLinesClearedAnimation = (lines) {
      _musicManager.playSoundEffect('line_clear');
      setState(() {
        currentMessage = MotivationalMessages.getMultiLine(lines.length);
      });
      
      // Check for level completion in adventure mode
      if (widget.mode == GameMode.adventure && 
          widget.level != null && 
          _targetLines != null &&
          engine.linesCleared >= _targetLines!) {
        _musicManager.playSoundEffect('level_complete');
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) {
            setState(() {
              showLevelComplete = true;
            });
          }
        });
      }
      
      Future.delayed(const Duration(milliseconds: 2000), () {
        if (mounted) {
          setState(() {
            currentMessage = null;
          });
        }
      });
    };
    engine.onPiecePlaced = () {
      _musicManager.playSoundEffect('piece_place');
      setState(() {
        currentMessage = MotivationalMessages.getRandomGeneral();
      });
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            currentMessage = null;
          });
        }
      });
    };
    engine.onGameOver = () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => GameOverScreen(
            score: engine.score,
            level: engine.level,
            linesCleared: engine.linesCleared,
            mode: widget.mode,
            levelNumber: widget.level,
          ),
        ),
      );
    };

    engine.start();
  }

  void _handlePanStart(DragStartDetails details) {
    _isDragging = true;
    _lastDragX = details.localPosition.dx;
    _lastDragY = details.localPosition.dy;
    _lastMoveTime = DateTime.now();
  }

  void _handlePanUpdate(DragUpdateDetails details) {
    if (!_isDragging) return;
    
    final engine = ref.read(gameEngineProvider);
    if (engine.state != GameState.playing) return;

    final now = DateTime.now();
    final dx = details.localPosition.dx - _lastDragX;
    final dy = details.localPosition.dy - _lastDragY;
    final distance = (dx * dx + dy * dy).abs();

    // Throttle moves to prevent too many updates - reduced for smoother control
    if (_lastMoveTime != null && now.difference(_lastMoveTime!).inMilliseconds < 80) {
      return;
    }

    // Minimum distance to trigger a move - reduced for better responsiveness
    if (distance < 20) return;

    if (dx.abs() > dy.abs()) {
      // Horizontal movement
      if (dx > 20) {
        engine.moveRight();
        _musicManager.playSoundEffect('move');
        _lastDragX = details.localPosition.dx;
        _lastMoveTime = now;
        setState(() {});
      } else if (dx < -20) {
        engine.moveLeft();
        _musicManager.playSoundEffect('move');
        _lastDragX = details.localPosition.dx;
        _lastMoveTime = now;
        setState(() {});
      }
    } else {
      // Vertical movement
      if (dy > 20) {
        engine.softDrop();
        _lastDragY = details.localPosition.dy;
        _lastMoveTime = now;
        setState(() {});
      }
    }
  }

  void _handlePanEnd(DragEndDetails details) {
    _isDragging = false;
    final engine = ref.read(gameEngineProvider);
    
    if (engine.state == GameState.playing) {
      // Check for fast swipe down (hard drop)
      if (details.velocity.pixelsPerSecond.dy > 800) {
        engine.hardDrop();
        setState(() {});
      } else {
        engine.stopSoftDrop();
      }
    }
  }

  void _handleTap() {
    final engine = ref.read(gameEngineProvider);
    if (engine.state == GameState.playing) {
      engine.rotate();
      _musicManager.playSoundEffect('rotate');
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ref.watch(themeProvider);
    final engine = ref.watch(gameEngineProvider);
    final board = ref.watch(gameBoardProvider);
    final avatar = ref.watch(avatarProvider);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: theme.backgroundGradient),
        child: SafeArea(
          child: GestureDetector(
            onPanStart: _handlePanStart,
            onPanUpdate: _handlePanUpdate,
            onPanEnd: _handlePanEnd,
            onTap: _handleTap,
            behavior: HitTestBehavior.opaque,
            child: Stack(
              children: [
                // Main Game UI
                Column(
                  children: [
                    // HUD
                    _buildHUD(engine, theme),
                    
                    // Game Board
                    Expanded(
                      child: Center(
                        child: _buildGameBoard(engine, board, theme),
                      ),
                    ),
                    
                    // Next Pieces
                    _buildNextPieces(engine, theme),
                    
                    // Control Instructions
                    _buildControlHints(),
                  ],
                ),

                // Level Complete Celebration
                if (showLevelComplete)
                  LevelCompleteWidget(
                    level: widget.level ?? 1,
                    onComplete: () {
                      setState(() {
                        showLevelComplete = false;
                      });
                      // Navigate to next level or game over
                      Future.delayed(const Duration(milliseconds: 500), () {
                        if (mounted) {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => GameOverScreen(
                                score: engine.score,
                                level: engine.level,
                                linesCleared: engine.linesCleared,
                                mode: widget.mode,
                                levelNumber: widget.level,
                              ),
                            ),
                          );
                        }
                      });
                    },
                  ),

                // Level Transition Overlay
                if (showLevelTransition && !showLevelComplete)
                  _LevelTransitionWidget(
                    level: engine.level,
                    onComplete: () {
                      setState(() {
                        showLevelTransition = false;
                      });
                    },
                  ),

                // Avatar Helper
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                      border: Border.all(color: avatar.color, width: 2),
                    ),
                    child: Text(
                      avatar.emoji,
                      style: const TextStyle(fontSize: 30),
                    ),
                  )
                      .animate(onPlay: (controller) => controller.repeat())
                      .scale(delay: 0.ms, duration: 1000.ms, begin: const Offset(1, 1), end: const Offset(1.1, 1.1))
                      .then()
                      .scale(duration: 1000.ms, begin: const Offset(1.1, 1.1), end: const Offset(1, 1)),
                ),

                // Message Overlay with Avatar
                if (currentMessage != null && !showLevelComplete)
                  Positioned(
                    top: 80,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 15,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              avatar.color.withOpacity(0.9),
                              avatar.color.withOpacity(0.7),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: avatar.color.withOpacity(0.5),
                              blurRadius: 20,
                              spreadRadius: 3,
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              avatar.emoji,
                              style: const TextStyle(fontSize: 30),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              currentMessage!,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(duration: 300.ms)
                          .scale(delay: 100.ms)
                          .then()
                          .shake(duration: 200.ms, delay: 500.ms),
                    ),
                  ),

                // Pause Button
                Positioned(
                  top: 10,
                  right: 10,
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () {
                        if (engine.state == GameState.playing) {
                          engine.pause();
                          _showPauseDialog();
                        } else {
                          engine.resume();
                        }
                        setState(() {});
                      },
                      borderRadius: BorderRadius.circular(25),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          engine.state == GameState.playing
                              ? Icons.pause
                              : Icons.play_arrow,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showPauseDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.black.withOpacity(0.9),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Game Paused',
          style: TextStyle(color: Colors.white, fontSize: 24),
        ),
        content: const Text(
          'Tap Resume to continue playing!',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(gameEngineProvider).resume();
              setState(() {});
            },
            child: const Text(
              'Resume',
              style: TextStyle(color: Colors.green, fontSize: 18),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text(
              'Quit',
              style: TextStyle(color: Colors.red, fontSize: 18),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHUD(GameEngine engine, theme) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 15.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatCard('Score', '${engine.score}', theme, Icons.star),
              _buildStatCard('Level', '${engine.level}', theme, Icons.trending_up),
              _buildStatCard('Lines', '${engine.linesCleared}', theme, Icons.grid_on),
            ],
          ),
        ),
        // Progress bar for adventure mode
        if (widget.mode == GameMode.adventure && _targetLines != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 5.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Level Progress',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${engine.linesCleared} / $_targetLines',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: (engine.linesCleared / _targetLines!).clamp(0.0, 1.0),
                    backgroundColor: Colors.white.withOpacity(0.2),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.green.withOpacity(0.8),
                    ),
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, theme, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(height: 5),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGameBoard(GameEngine engine, GameBoard board, theme) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.4),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.4), width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: RepaintBoundary(
        child: CustomPaint(
          size: const Size(300, 600),
          painter: _GameBoardPainter(
            board: board,
            currentPiece: engine.currentPiece,
            currentX: engine.currentX,
            currentY: engine.currentY,
            theme: theme,
          ),
        ),
      ),
    )
        .animate(onPlay: (controller) => controller.repeat())
        .shimmer(duration: 3000.ms, color: Colors.white.withOpacity(0.1));
  }

  Widget _buildNextPieces(GameEngine engine, theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 10.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.next_plan, color: Colors.white70, size: 24),
          const SizedBox(width: 10),
          const Text(
            'Next: ',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 10),
          if (engine.nextPiece != null)
            _buildNextPiecePreview(engine.nextPiece!, theme),
        ],
      ),
    );
  }

  Widget _buildNextPiecePreview(Tetromino piece, theme) {
    final shape = piece.currentShape;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: CustomPaint(
        size: Size(shape[0].length * 25.0, shape.length * 25.0),
        painter: _TetrominoPainter(tetromino: piece),
      ),
    );
  }

  Widget _buildControlHints() {
    return Padding(
      padding: const EdgeInsets.all(15.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildHint('← →', 'Move'),
          _buildHint('↓', 'Drop'),
          _buildHint('Tap', 'Rotate'),
        ],
      ),
    );
  }

  Widget _buildHint(String icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            icon,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 5),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}

class _GameBoardPainter extends CustomPainter {
  final GameBoard board;
  final Tetromino? currentPiece;
  final int currentX;
  final int currentY;
  final theme;

  _GameBoardPainter({
    required this.board,
    required this.currentPiece,
    required this.currentX,
    required this.currentY,
    required this.theme,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cellWidth = size.width / GameBoard.width;
    final cellHeight = size.height / GameBoard.height;

    // Draw background grid
    final gridPaint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    for (int row = 0; row < GameBoard.height; row++) {
      for (int col = 0; col < GameBoard.width; col++) {
        final rect = Rect.fromLTWH(
          col * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight,
        );
        canvas.drawRect(rect, gridPaint);
      }
    }

    // Draw placed blocks with glow effect
    for (int row = 0; row < GameBoard.height; row++) {
      for (int col = 0; col < GameBoard.width; col++) {
        if (board.grid[row][col] != null) {
          final color = board.grid[row][col]!;
          
          // Glow effect
          final glowPaint = Paint()
            ..color = color.withOpacity(0.3)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);
          
          final rect = Rect.fromLTWH(
            col * cellWidth + 2,
            row * cellHeight + 2,
            cellWidth - 4,
            cellHeight - 4,
          );
          canvas.drawRRect(
            RRect.fromRectAndRadius(rect, const Radius.circular(6)),
            glowPaint,
          );
          
          // Main block
          final paint = Paint()
            ..color = color
            ..style = PaintingStyle.fill;
          canvas.drawRRect(
            RRect.fromRectAndRadius(rect, const Radius.circular(6)),
            paint,
          );
          
          // Highlight
          final highlightPaint = Paint()
            ..color = Colors.white.withOpacity(0.3)
            ..style = PaintingStyle.fill;
          final highlightRect = Rect.fromLTWH(
            col * cellWidth + 3,
            row * cellHeight + 3,
            cellWidth * 0.4,
            cellHeight * 0.4,
          );
          canvas.drawRRect(
            RRect.fromRectAndRadius(highlightRect, const Radius.circular(3)),
            highlightPaint,
          );
        }
      }
    }

    // Draw current piece with enhanced animation effect
    if (currentPiece != null) {
      final shape = currentPiece!.currentShape;
      final time = DateTime.now().millisecondsSinceEpoch / 1000.0;
      final pulse = (math.sin(time * 3) + 1) / 2; // Pulsing effect
      
      for (int row = 0; row < shape.length; row++) {
        for (int col = 0; col < shape[row].length; col++) {
          if (shape[row][col] == 1) {
            final color = currentPiece!.color;
            
            // Animated outer glow
            final glowPaint = Paint()
              ..color = color.withOpacity(0.3 + pulse * 0.2)
              ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12);
            
            final rect = Rect.fromLTWH(
              (currentX + col) * cellWidth + 1,
              (currentY + row) * cellHeight + 1,
              cellWidth - 2,
              cellHeight - 2,
            );
            canvas.drawRRect(
              RRect.fromRectAndRadius(rect, const Radius.circular(7)),
              glowPaint,
            );
            
            // Main piece with gradient effect
            final gradient = LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color,
                color.withOpacity(0.8),
              ],
            );
            final gradientPaint = Paint()
              ..shader = gradient.createShader(rect)
              ..style = PaintingStyle.fill;
            canvas.drawRRect(
              RRect.fromRectAndRadius(rect, const Radius.circular(7)),
              gradientPaint,
            );
            
            // Animated bright highlight
            final highlightPaint = Paint()
              ..color = Colors.white.withOpacity(0.4 + pulse * 0.3)
              ..style = PaintingStyle.fill;
            final highlightRect = Rect.fromLTWH(
              (currentX + col) * cellWidth + 4,
              (currentY + row) * cellHeight + 4,
              cellWidth * 0.5,
              cellHeight * 0.5,
            );
            canvas.drawRRect(
              RRect.fromRectAndRadius(highlightRect, const Radius.circular(4)),
              highlightPaint,
            );
            
            // Border
            final borderPaint = Paint()
              ..color = Colors.white.withOpacity(0.6)
              ..style = PaintingStyle.stroke
              ..strokeWidth = 1.5;
            canvas.drawRRect(
              RRect.fromRectAndRadius(rect, const Radius.circular(7)),
              borderPaint,
            );
          }
        }
      }
    }
  }

  @override
  bool shouldRepaint(_GameBoardPainter oldDelegate) {
    // Always repaint for smooth animations
    return true;
  }
}

class _TetrominoPainter extends CustomPainter {
  final Tetromino tetromino;

  _TetrominoPainter({required this.tetromino});

  @override
  void paint(Canvas canvas, Size size) {
    final shape = tetromino.currentShape;
    final cellWidth = size.width / shape[0].length;
    final cellHeight = size.height / shape.length;

    for (int row = 0; row < shape.length; row++) {
      for (int col = 0; col < shape[row].length; col++) {
        if (shape[row][col] == 1) {
          final paint = Paint()
            ..color = tetromino.color
            ..style = PaintingStyle.fill;
          final rect = Rect.fromLTWH(
            col * cellWidth + 1,
            row * cellHeight + 1,
            cellWidth - 2,
            cellHeight - 2,
          );
          canvas.drawRRect(
            RRect.fromRectAndRadius(rect, const Radius.circular(3)),
            paint,
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(_TetrominoPainter oldDelegate) => false;
}

class _LevelTransitionWidget extends StatelessWidget {
  final int level;
  final VoidCallback onComplete;

  const _LevelTransitionWidget({
    required this.level,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.95),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'LEVEL $level',
              style: const TextStyle(
                fontSize: 64,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 8,
              ),
            )
                .animate()
                .scale(delay: 200.ms, duration: 500.ms)
                .then()
                .shake(duration: 300.ms)
                .then()
                .fadeOut(duration: 500.ms),
            const SizedBox(height: 30),
            const Text(
              'Get Ready!',
              style: TextStyle(
                fontSize: 32,
                color: Colors.white70,
              ),
            )
                .animate()
                .fadeIn(delay: 600.ms, duration: 400.ms)
                .then()
                .fadeOut(delay: 800.ms, duration: 400.ms),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 300.ms)
        .then(delay: 2000.ms)
        .fadeOut(duration: 300.ms)
        .callback(callback: (_) => onComplete());
  }
}
