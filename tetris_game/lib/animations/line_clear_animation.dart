import 'package:flutter/material.dart';
import 'dart:math' as math;

class LineClearAnimation extends StatefulWidget {
  final List<int> clearedLines;
  final Color color;
  final VoidCallback onComplete;

  const LineClearAnimation({
    super.key,
    required this.clearedLines,
    required this.color,
    required this.onComplete,
  });

  @override
  State<LineClearAnimation> createState() => _LineClearAnimationState();
}

class _LineClearAnimationState extends State<LineClearAnimation>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  final List<Particle> _particles = [];

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.clearedLines.length,
      (index) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 800),
      ),
    );

    // Create particles for each cleared line
    for (int i = 0; i < widget.clearedLines.length; i++) {
      final random = math.Random();
      for (int j = 0; j < 20; j++) {
        _particles.add(Particle(
          x: random.nextDouble() * 400,
          y: widget.clearedLines[i] * 30.0,
          vx: (random.nextDouble() - 0.5) * 10,
          vy: (random.nextDouble() - 0.5) * 10,
          color: widget.color,
        ));
      }
    }

    // Start animations
    for (var controller in _controllers) {
      controller.forward();
    }

    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        widget.onComplete();
      }
    });
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _ParticlePainter(
        particles: _particles,
        controllers: _controllers,
      ),
      child: Container(),
    );
  }
}

class Particle {
  double x;
  double y;
  double vx;
  double vy;
  Color color;
  double opacity = 1.0;

  Particle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.color,
  });

  void update() {
    x += vx;
    y += vy;
    vy += 0.5; // Gravity
    opacity -= 0.02;
    if (opacity < 0) opacity = 0;
  }
}

class _ParticlePainter extends CustomPainter {
  final List<Particle> particles;
  final List<AnimationController> controllers;

  _ParticlePainter({
    required this.particles,
    required this.controllers,
  }) : super(repaint: controllers.first);

  @override
  void paint(Canvas canvas, Size size) {
    for (var particle in particles) {
      particle.update();
      final paint = Paint()
        ..color = particle.color.withOpacity(particle.opacity)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(
        Offset(particle.x, particle.y),
        4,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_ParticlePainter oldDelegate) => true;
}

