import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class BlockPlacementEffect extends StatelessWidget {
  final Color color;
  final Offset position;
  final VoidCallback onComplete;

  const BlockPlacementEffect({
    super.key,
    required this.color,
    required this.position,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: position.dx,
      top: position.dy,
      child: Container(
        width: 30,
        height: 30,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(4),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.8),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
      )
          .animate()
          .scale(
            begin: const Offset(0.5, 0.5),
            end: const Offset(1.2, 1.2),
            duration: 200.ms,
          )
          .then()
          .scale(
            begin: const Offset(1.2, 1.2),
            end: const Offset(1.0, 1.0),
            duration: 100.ms,
          )
          .then()
          .fadeOut(duration: 300.ms)
          .callback(callback: (_) => onComplete()),
    );
  }
}

