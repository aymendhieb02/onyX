import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math' as math;

class CelebrationWidget extends StatefulWidget {
  final VoidCallback onComplete;
  final String message;
  final Color color;

  const CelebrationWidget({
    super.key,
    required this.onComplete,
    required this.message,
    this.color = Colors.yellow,
  });

  @override
  State<CelebrationWidget> createState() => _CelebrationWidgetState();
}

class _CelebrationWidgetState extends State<CelebrationWidget>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  final List<ConfettiParticle> _particles = [];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );

    // Create confetti particles
    final random = math.Random();
    for (int i = 0; i < 50; i++) {
      _particles.add(ConfettiParticle(
        x: random.nextDouble() * 400,
        y: random.nextDouble() * 800,
        vx: (random.nextDouble() - 0.5) * 5,
        vy: random.nextDouble() * -10 - 5,
        color: [
          Colors.red,
          Colors.blue,
          Colors.green,
          Colors.yellow,
          Colors.purple,
          Colors.orange,
        ][random.nextInt(6)],
        size: random.nextDouble() * 10 + 5,
      ));
    }

    _controller.forward();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        widget.onComplete();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _ConfettiPainter(
            particles: _particles,
            progress: _controller.value,
          ),
          child: Container(),
        );
      },
    );
  }
}

class ConfettiParticle {
  double x;
  double y;
  double vx;
  double vy;
  Color color;
  double size;
  double rotation = 0;
  double rotationSpeed;

  ConfettiParticle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.color,
    required this.size,
  }) : rotationSpeed = (math.Random().nextDouble() - 0.5) * 0.2;

  void update(double dt) {
    x += vx * dt * 60;
    y += vy * dt * 60;
    vy += 0.5 * dt * 60; // Gravity
    rotation += rotationSpeed * dt * 60;
  }
}

class _ConfettiPainter extends CustomPainter {
  final List<ConfettiParticle> particles;
  final double progress;

  _ConfettiPainter({
    required this.particles,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (var particle in particles) {
      particle.update(0.016); // ~60fps
      final paint = Paint()
        ..color = particle.color.withOpacity(1.0 - progress)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(particle.x, particle.y);
      canvas.rotate(particle.rotation);
      canvas.drawRect(
        Rect.fromCenter(
          center: Offset.zero,
          width: particle.size,
          height: particle.size,
        ),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter oldDelegate) => true;
}

class LevelCompleteWidget extends StatelessWidget {
  final int level;
  final VoidCallback onComplete;

  const LevelCompleteWidget({
    super.key,
    required this.level,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.9),
      child: Stack(
        children: [
          // Confetti background
          CelebrationWidget(
            onComplete: () {},
            message: '',
            color: Colors.yellow,
          ),
          
          // Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Star icon
                const Icon(
                  Icons.star,
                  size: 100,
                  color: Colors.yellow,
                )
                    .animate()
                    .scale(delay: 200.ms, duration: 500.ms, begin: const Offset(0, 0), end: const Offset(1.5, 1.5))
                    .then()
                    .scale(duration: 300.ms, begin: const Offset(1.5, 1.5), end: const Offset(1, 1))
                    .then()
                    .shimmer(duration: 1000.ms),
                
                const SizedBox(height: 30),
                
                // Level Complete text
                Text(
                  'LEVEL $level',
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 4,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 400.ms, duration: 500.ms)
                    .slideY(begin: -0.3, end: 0),
                
                const SizedBox(height: 10),
                
                const Text(
                  'COMPLETE!',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.yellow,
                    letterSpacing: 3,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 600.ms, duration: 500.ms)
                    .slideY(begin: 0.3, end: 0)
                    .then()
                    .shake(duration: 400.ms),
                
                const SizedBox(height: 40),
                
                // Celebration emojis
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: ['🎉', '⭐', '🏆', '🎊', '🌟']
                      .map((emoji) => Text(
                            emoji,
                            style: const TextStyle(fontSize: 40),
                          )
                              .animate()
                              .scale(delay: (800 + 100 * ['🎉', '⭐', '🏆', '🎊', '🌟'].indexOf(emoji)).ms, duration: 400.ms)
                              .then()
                              .shake())
                      .toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 300.ms)
        .then(delay: 2500.ms)
        .fadeOut(duration: 300.ms)
        .callback(callback: (_) => onComplete());
  }
}

