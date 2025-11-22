import 'package:flutter/material.dart';

enum GameTheme {
  space,
  ocean,
  forest,
  neon,
  rainbow,
}

class GameThemeData {
  final GameTheme theme;
  final String name;
  final Color primaryColor;
  final Color secondaryColor;
  final Color backgroundColor;
  final List<Color> blockColors;
  final Gradient backgroundGradient;
  final String emoji;

  GameThemeData({
    required this.theme,
    required this.name,
    required this.primaryColor,
    required this.secondaryColor,
    required this.backgroundColor,
    required this.blockColors,
    required this.backgroundGradient,
    required this.emoji,
  });

  static GameThemeData fromTheme(GameTheme theme) {
    switch (theme) {
      case GameTheme.space:
        return GameThemeData(
          theme: theme,
          name: 'Space',
          primaryColor: const Color(0xFF1a1a2e),
          secondaryColor: const Color(0xFF16213e),
          backgroundColor: const Color(0xFF0f3460),
          blockColors: [
            Colors.cyan,
            Colors.blue,
            Colors.purple,
            Colors.indigo,
            Colors.deepPurple,
          ],
          backgroundGradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF0f3460),
              Color(0xFF16213e),
              Color(0xFF1a1a2e),
            ],
          ),
          emoji: '🚀',
        );
      case GameTheme.ocean:
        return GameThemeData(
          theme: theme,
          name: 'Ocean',
          primaryColor: const Color(0xFF006994),
          secondaryColor: const Color(0xFF0080a3),
          backgroundColor: const Color(0xFF00a8cc),
          blockColors: [
            Colors.blue,
            Colors.lightBlue,
            Colors.cyan,
            Colors.teal,
            Colors.blueAccent,
          ],
          backgroundGradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF00a8cc),
              Color(0xFF0080a3),
              Color(0xFF006994),
            ],
          ),
          emoji: '🌊',
        );
      case GameTheme.forest:
        return GameThemeData(
          theme: theme,
          name: 'Forest',
          primaryColor: const Color(0xFF2d5016),
          secondaryColor: const Color(0xFF3d6b1f),
          backgroundColor: const Color(0xFF4d7c2f),
          blockColors: [
            Colors.green,
            Colors.lightGreen,
            Colors.greenAccent,
            Colors.teal,
            Colors.lime,
          ],
          backgroundGradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF4d7c2f),
              Color(0xFF3d6b1f),
              Color(0xFF2d5016),
            ],
          ),
          emoji: '🌲',
        );
      case GameTheme.neon:
        return GameThemeData(
          theme: theme,
          name: 'Neon',
          primaryColor: const Color(0xFF1a0033),
          secondaryColor: const Color(0xFF330066),
          backgroundColor: const Color(0xFF4d0099),
          blockColors: [
            Colors.pink,
            Colors.purple,
            Colors.deepPurple,
            Colors.blue,
            Colors.cyan,
          ],
          backgroundGradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF4d0099),
              Color(0xFF330066),
              Color(0xFF1a0033),
            ],
          ),
          emoji: '💜',
        );
      case GameTheme.rainbow:
        return GameThemeData(
          theme: theme,
          name: 'Rainbow',
          primaryColor: const Color(0xFFFF6B6B),
          secondaryColor: const Color(0xFF4ECDC4),
          backgroundColor: const Color(0xFFFFE66D),
          blockColors: [
            Colors.red,
            Colors.orange,
            Colors.yellow,
            Colors.green,
            Colors.blue,
            Colors.indigo,
            Colors.purple,
          ],
          backgroundGradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFF6B6B),
              Color(0xFFFFE66D),
              Color(0xFF4ECDC4),
              Color(0xFF45B7D1),
              Color(0xFF96CEB4),
            ],
          ),
          emoji: '🌈',
        );
    }
  }

  static List<GameThemeData> getAllThemes() {
    return GameTheme.values.map((theme) => GameThemeData.fromTheme(theme)).toList();
  }
}

