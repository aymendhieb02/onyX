import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'game_board.dart';
import 'game_engine.dart';

enum PowerUpType {
  slowMotion,
  clearLine,
  ghostPreview,
  bomb,
  freeze,
}

class PowerUp {
  final PowerUpType type;
  final String name;
  final String description;
  final Color color;
  final IconData icon;

  PowerUp({
    required this.type,
    required this.name,
    required this.description,
    required this.color,
    required this.icon,
  });

  static PowerUp fromType(PowerUpType type) {
    switch (type) {
      case PowerUpType.slowMotion:
        return PowerUp(
          type: type,
          name: 'Slow Motion',
          description: 'Slows down falling blocks',
          color: Colors.blue,
          icon: Icons.slow_motion_video,
        );
      case PowerUpType.clearLine:
        return PowerUp(
          type: type,
          name: 'Clear Line',
          description: 'Removes a random line',
          color: Colors.green,
          icon: Icons.clear_all,
        );
      case PowerUpType.ghostPreview:
        return PowerUp(
          type: type,
          name: 'Ghost Preview',
          description: 'Shows where block will land',
          color: Colors.purple,
          icon: Icons.visibility,
        );
      case PowerUpType.bomb:
        return PowerUp(
          type: type,
          name: 'Bomb',
          description: 'Clears blocks in radius',
          color: Colors.red,
          icon: Icons.whatshot,
        );
      case PowerUpType.freeze:
        return PowerUp(
          type: type,
          name: 'Freeze',
          description: 'Freezes blocks temporarily',
          color: Colors.cyan,
          icon: Icons.ac_unit,
        );
    }
  }
}

class PowerUpManager {
  final GameEngine engine;
  final GameBoard board;
  PowerUp? activePowerUp;
  Timer? powerUpTimer;
  bool ghostPreviewEnabled = false;
  double originalFallSpeed = 1000.0;

  Function(PowerUpType)? onPowerUpActivated;
  Function()? onPowerUpExpired;

  PowerUpManager({
    required this.engine,
    required this.board,
  });

  void activatePowerUp(PowerUpType type) {
    activePowerUp = PowerUp.fromType(type);
    onPowerUpActivated?.call(type);

    switch (type) {
      case PowerUpType.slowMotion:
        originalFallSpeed = engine.fallSpeed;
        engine.fallSpeed = engine.fallSpeed * 2;
        engine.restartGameLoop();
        powerUpTimer = Timer(const Duration(seconds: 10), () {
          engine.fallSpeed = originalFallSpeed;
          engine.restartGameLoop();
          activePowerUp = null;
          onPowerUpExpired?.call();
        });
        break;

      case PowerUpType.clearLine:
        _clearRandomLine();
        activePowerUp = null;
        onPowerUpExpired?.call();
        break;

      case PowerUpType.ghostPreview:
        ghostPreviewEnabled = true;
        powerUpTimer = Timer(const Duration(seconds: 15), () {
          ghostPreviewEnabled = false;
          activePowerUp = null;
          onPowerUpExpired?.call();
        });
        break;

      case PowerUpType.bomb:
        _activateBomb();
        activePowerUp = null;
        onPowerUpExpired?.call();
        break;

      case PowerUpType.freeze:
        engine.pause();
        powerUpTimer = Timer(const Duration(seconds: 5), () {
          engine.resume();
          activePowerUp = null;
          onPowerUpExpired?.call();
        });
        break;
    }
  }

  void _clearRandomLine() {
    final random = Random();
    final filledLines = <int>[];
    for (int row = 0; row < GameBoard.height; row++) {
      if (board.grid[row].any((cell) => cell != null)) {
        filledLines.add(row);
      }
    }
    if (filledLines.isNotEmpty) {
      final lineToClear = filledLines[random.nextInt(filledLines.length)];
      board.grid[lineToClear] = List.filled(GameBoard.width, null);
      engine.linesCleared++;
      engine.onLinesCleared?.call();
    }
  }

  void _activateBomb() {
    final random = Random();
    final bombX = random.nextInt(GameBoard.width);
    final bombY = random.nextInt(GameBoard.height);
    const radius = 2;

    for (int dy = -radius; dy <= radius; dy++) {
      for (int dx = -radius; dx <= radius; dx++) {
        final x = bombX + dx;
        final y = bombY + dy;
        if (x >= 0 &&
            x < GameBoard.width &&
            y >= 0 &&
            y < GameBoard.height &&
            (dx * dx + dy * dy <= radius * radius)) {
          board.grid[y][x] = null;
        }
      }
    }
  }

  PowerUp? getRandomPowerUp() {
    final random = Random();
    final types = PowerUpType.values;
    return PowerUp.fromType(types[random.nextInt(types.length)]);
  }

  void dispose() {
    powerUpTimer?.cancel();
  }
}

