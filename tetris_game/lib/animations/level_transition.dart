import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class LevelTransition extends StatelessWidget {
  final int level;
  final VoidCallback onComplete;

  const LevelTransition({
    super.key,
    required this.level,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.9),
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

