import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/avatar_provider.dart';
import '../features/avatars.dart';
import '../providers/theme_provider.dart';
import 'mode_selection_screen.dart';

class AvatarSelectionScreen extends ConsumerStatefulWidget {
  const AvatarSelectionScreen({super.key});

  @override
  ConsumerState<AvatarSelectionScreen> createState() => _AvatarSelectionScreenState();
}

class _AvatarSelectionScreenState extends ConsumerState<AvatarSelectionScreen> {
  @override
  Widget build(BuildContext context) {
    final theme = ref.watch(themeProvider);
    final currentAvatar = ref.watch(avatarProvider);
    final avatars = Avatar.getAllAvatars();

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: theme.backgroundGradient),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text(
                      'Choose Your Character!',
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
                      'Pick your favorite helper!',
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

              // Avatar Grid
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(20),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 20,
                    mainAxisSpacing: 20,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: avatars.length,
                  itemBuilder: (context, index) {
                    final avatar = avatars[index];
                    final isSelected = avatar.type == currentAvatar.type;

                    return GestureDetector(
                      onTap: () {
                        ref.read(avatarProvider.notifier).setAvatar(avatar.type);
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              avatar.color.withOpacity(0.8),
                              avatar.color.withOpacity(0.4),
                            ],
                          ),
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
                              avatar.emoji,
                              style: const TextStyle(fontSize: 70),
                            )
                                .animate()
                                .scale(delay: (index * 100).ms, duration: 400.ms)
                                .then()
                                .shimmer(duration: 2000.ms, delay: 1000.ms),
                            const SizedBox(height: 15),
                            Text(
                              avatar.name,
                              style: const TextStyle(
                                fontSize: 20,
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
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (_) => const ModeSelectionScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: theme.primaryColor,
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

