import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../themes/theme_data.dart';
import '../providers/theme_provider.dart';
import 'avatar_selection_screen.dart';

class ThemeSelectionScreen extends ConsumerStatefulWidget {
  const ThemeSelectionScreen({super.key});

  @override
  ConsumerState<ThemeSelectionScreen> createState() => _ThemeSelectionScreenState();
}

class _ThemeSelectionScreenState extends ConsumerState<ThemeSelectionScreen> {
  @override
  Widget build(BuildContext context) {
    final currentTheme = ref.watch(themeProvider);
    final themes = GameThemeData.getAllThemes();

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.deepPurple.shade900,
              Colors.purple.shade700,
              Colors.blue.shade900,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text(
                      'Choose Your Theme',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    )
                        .animate()
                        .fadeIn(duration: 600.ms)
                        .slideY(begin: -0.2, end: 0),
                    const SizedBox(height: 10),
                    const Text(
                      'Pick your favorite adventure style!',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 200.ms, duration: 600.ms),
                  ],
                ),
              ),

              // Theme Grid
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(20),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: themes.length,
                  itemBuilder: (context, index) {
                    final theme = themes[index];
                    final isSelected = theme.theme == currentTheme.theme;

                    return GestureDetector(
                      onTap: () {
                        ref.read(themeProvider.notifier).setTheme(theme.theme);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: theme.backgroundGradient,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? Colors.white : Colors.transparent,
                            width: 4,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isSelected
                                  ? Colors.white.withOpacity(0.5)
                                  : Colors.black.withOpacity(0.3),
                              blurRadius: isSelected ? 20 : 10,
                              spreadRadius: isSelected ? 2 : 0,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              theme.emoji,
                              style: const TextStyle(fontSize: 60),
                            )
                                .animate()
                                .scale(delay: (index * 100).ms, duration: 400.ms),
                            const SizedBox(height: 15),
                            Text(
                              theme.name,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            if (isSelected) ...[
                              const SizedBox(height: 10),
                              const Icon(
                                Icons.check_circle,
                                color: Colors.white,
                                size: 30,
                              )
                                  .animate()
                                  .scale(duration: 300.ms)
                                  .then()
                                  .shake(),
                            ],
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(delay: (index * 100).ms, duration: 600.ms)
                          .slideY(begin: 0.3, end: 0),
                    );
                  },
                ),
              ),

              // Continue Button
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const AvatarSelectionScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.deepPurple,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 60,
                      vertical: 20,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 10,
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
                    .animate()
                    .fadeIn(delay: 800.ms, duration: 600.ms)
                    .scale(delay: 800.ms),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

