import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/theme_provider.dart';
import '../modes/adventure_mode.dart';
import '../modes/classic_mode.dart';
import 'mode_selection_screen.dart';
import 'game_screen.dart';

class GameOverScreen extends ConsumerStatefulWidget {
  final int score;
  final int level;
  final int linesCleared;
  final GameMode mode;
  final int? levelNumber;

  const GameOverScreen({
    super.key,
    required this.score,
    required this.level,
    required this.linesCleared,
    required this.mode,
    this.levelNumber,
  });

  @override
  ConsumerState<GameOverScreen> createState() => _GameOverScreenState();
}

class _GameOverScreenState extends ConsumerState<GameOverScreen> {
  bool _isNewHighScore = false;
  bool _levelCompleted = false;

  @override
  void initState() {
    super.initState();
    _checkResults();
  }

  Future<void> _checkResults() async {
    if (widget.mode == GameMode.classic) {
      final classicMode = ClassicMode();
      final highScore = await classicMode.getHighScore();
      if (widget.score > highScore) {
        await classicMode.saveHighScore(widget.score);
        setState(() {
          _isNewHighScore = true;
        });
      }
    } else if (widget.mode == GameMode.adventure && widget.levelNumber != null) {
      final adventureMode = ref.read(adventureModeProvider);
      final levelData = adventureMode.getLevel(widget.levelNumber!);
      if (levelData != null && widget.linesCleared >= levelData.targetLines) {
        await adventureMode.unlockLevel(widget.levelNumber! + 1);
        setState(() {
          _levelCompleted = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ref.watch(themeProvider);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: theme.backgroundGradient),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Game Over Text
                const Text(
                  'GAME OVER',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 4,
                  ),
                )
                    .animate()
                    .fadeIn(duration: 500.ms)
                    .scale(delay: 200.ms)
                    .then()
                    .shake(),

                const SizedBox(height: 40),

                // Results
                Container(
                  padding: const EdgeInsets.all(30),
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      _buildResultRow('Score', '${widget.score}'),
                      const SizedBox(height: 15),
                      _buildResultRow('Level', '${widget.level}'),
                      const SizedBox(height: 15),
                      _buildResultRow('Lines Cleared', '${widget.linesCleared}'),
                      if (_isNewHighScore) ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.yellow.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.star, color: Colors.yellow),
                              SizedBox(width: 10),
                              Text(
                                'New High Score!',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.yellow,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      if (_levelCompleted) ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, color: Colors.green),
                              SizedBox(width: 10),
                              Text(
                                'Level Completed!',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                )
                    .animate()
                    .fadeIn(delay: 400.ms, duration: 600.ms)
                    .slideY(begin: 0.3, end: 0),

                const SizedBox(height: 40),

                // Buttons
                Column(
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        if (widget.mode == GameMode.adventure && widget.levelNumber != null) {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                              builder: (_) => GameScreen(
                                mode: GameMode.adventure,
                                level: widget.levelNumber,
                              ),
                            ),
                          );
                        } else {
                          Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                        builder: (_) => GameScreen(
                          mode: widget.mode,
                        ),
                            ),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: theme.primaryColor,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 40,
                          vertical: 15,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      child: const Text(
                        'Play Again',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(
                            builder: (_) => const ModeSelectionScreen(),
                          ),
                          (route) => false,
                        );
                      },
                      child: Text(
                        'Main Menu',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                  ],
                )
                    .animate()
                    .fadeIn(delay: 800.ms, duration: 600.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 18,
            color: Colors.white70,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }
}

