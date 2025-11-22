import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme_selection_screen.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToThemeSelection();
  }

  void _navigateToThemeSelection() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const ThemeSelectionScreen()),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
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
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated Tetris Logo
              Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.gamepad,
                  size: 100,
                  color: Colors.deepPurple,
                ),
              )
                  .animate()
                  .scale(delay: 200.ms, duration: 600.ms)
                  .then()
                  .shake(duration: 400.ms)
                  .then()
                  .scale(delay: 200.ms, duration: 400.ms),
              
              const SizedBox(height: 40),
              
              // Game Title
              const Text(
                'TETRIS',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 8,
                ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 800.ms)
                  .slideY(begin: -0.3, end: 0),
              
              const SizedBox(height: 20),
              
              // Subtitle
              const Text(
                'Adventure Awaits!',
                style: TextStyle(
                  fontSize: 20,
                  color: Colors.white70,
                  letterSpacing: 2,
                ),
              )
                  .animate()
                  .fadeIn(delay: 1000.ms, duration: 800.ms),
              
              const SizedBox(height: 60),
              
              // Loading Indicator
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              )
                  .animate()
                  .fadeIn(delay: 1500.ms)
                  .scale(delay: 1500.ms),
            ],
          ),
        ),
      ),
    );
  }
}

