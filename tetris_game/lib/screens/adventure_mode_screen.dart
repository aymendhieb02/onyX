import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/theme_provider.dart';
import '../modes/adventure_mode.dart';
import 'game_screen.dart';

class AdventureModeScreen extends ConsumerStatefulWidget {
  const AdventureModeScreen({super.key});

  @override
  ConsumerState<AdventureModeScreen> createState() => _AdventureModeScreenState();
}

class _AdventureModeScreenState extends ConsumerState<AdventureModeScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = ref.watch(themeProvider);
    final adventureMode = ref.watch(adventureModeProvider);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: theme.backgroundGradient),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => Navigator.of(context).pop(),
                        borderRadius: BorderRadius.circular(25),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.arrow_back, color: Colors.white, size: 24),
                        ),
                      ),
                    ),
                    const Expanded(
                      child: Text(
                        'Adventure Mode',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 48), // Balance the back button
                  ],
                ),
              ),

              // Levels Grid
              Expanded(
                child: FutureBuilder<int>(
                  future: adventureMode.getHighestUnlockedLevel(),
                  builder: (context, snapshot) {
                    final highestUnlocked = snapshot.data ?? 1;
                    return GridView.builder(
                      padding: const EdgeInsets.all(20),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 15,
                        childAspectRatio: 0.8,
                      ),
                      itemCount: adventureMode.levels.length,
                      itemBuilder: (context, index) {
                        final level = adventureMode.levels[index];
                        final isUnlocked = level.levelNumber <= highestUnlocked;
                        final isLocked = !isUnlocked;

                        return GestureDetector(
                          onTap: isUnlocked
                              ? () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => GameScreen(
                                        mode: GameMode.adventure,
                                        level: level.levelNumber,
                                      ),
                                    ),
                                  );
                                }
                              : null,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: isUnlocked
                                  ? LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        theme.primaryColor,
                                        theme.secondaryColor,
                                      ],
                                    )
                                  : null,
                              color: isLocked
                                  ? Colors.grey.withOpacity(0.3)
                                  : null,
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(
                                color: isUnlocked
                                    ? Colors.white.withOpacity(0.5)
                                    : Colors.grey.withOpacity(0.5),
                                width: 2,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (isLocked)
                                  const Icon(
                                    Icons.lock,
                                    color: Colors.white70,
                                    size: 40,
                                  )
                                else
                                  Text(
                                    '${level.levelNumber}',
                                    style: const TextStyle(
                                      fontSize: 36,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                const SizedBox(height: 10),
                                Text(
                                  level.name,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isLocked
                                        ? Colors.white60
                                        : Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (isUnlocked) ...[
                                  const SizedBox(height: 5),
                                  Text(
                                    '${level.targetLines} lines',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Colors.white70,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          )
                              .animate()
                              .fadeIn(delay: (index * 50).ms, duration: 400.ms)
                              .scale(delay: (index * 50).ms),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

