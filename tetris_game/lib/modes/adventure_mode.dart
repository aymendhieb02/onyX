import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum GameMode { adventure, classic }

class LevelData {
  final int levelNumber;
  final String name;
  final String description;
  final int targetLines;
  final int? timeLimit; // in seconds, null for no limit
  final int startingLevel;
  final double fallSpeed;
  final List<List<int>>? preFilledBlocks; // Optional pre-filled configuration

  LevelData({
    required this.levelNumber,
    required this.name,
    required this.description,
    required this.targetLines,
    this.timeLimit,
    required this.startingLevel,
    required this.fallSpeed,
    this.preFilledBlocks,
  });
}

class AdventureMode {
  final List<LevelData> levels = [
    LevelData(
      levelNumber: 1,
      name: 'Getting Started',
      description: 'Clear 5 lines to complete!',
      targetLines: 5,
      startingLevel: 1,
      fallSpeed: 1000.0,
    ),
    LevelData(
      levelNumber: 2,
      name: 'Speed Up',
      description: 'Clear 10 lines!',
      targetLines: 10,
      startingLevel: 1,
      fallSpeed: 900.0,
    ),
    LevelData(
      levelNumber: 3,
      name: 'Time Challenge',
      description: 'Clear 8 lines in 60 seconds!',
      targetLines: 8,
      timeLimit: 60,
      startingLevel: 2,
      fallSpeed: 800.0,
    ),
    LevelData(
      levelNumber: 4,
      name: 'Double Trouble',
      description: 'Clear 15 lines!',
      targetLines: 15,
      startingLevel: 2,
      fallSpeed: 700.0,
    ),
    LevelData(
      levelNumber: 5,
      name: 'Rush Hour',
      description: 'Clear 12 lines in 45 seconds!',
      targetLines: 12,
      timeLimit: 45,
      startingLevel: 3,
      fallSpeed: 600.0,
    ),
    LevelData(
      levelNumber: 6,
      name: 'Tower Challenge',
      description: 'Clear 20 lines!',
      targetLines: 20,
      startingLevel: 3,
      fallSpeed: 500.0,
    ),
    LevelData(
      levelNumber: 7,
      name: 'Quick Draw',
      description: 'Clear 10 lines in 30 seconds!',
      targetLines: 10,
      timeLimit: 30,
      startingLevel: 4,
      fallSpeed: 400.0,
    ),
    LevelData(
      levelNumber: 8,
      name: 'Marathon',
      description: 'Clear 25 lines!',
      targetLines: 25,
      startingLevel: 4,
      fallSpeed: 450.0,
    ),
    LevelData(
      levelNumber: 9,
      name: 'Lightning Round',
      description: 'Clear 15 lines in 40 seconds!',
      targetLines: 15,
      timeLimit: 40,
      startingLevel: 5,
      fallSpeed: 350.0,
    ),
    LevelData(
      levelNumber: 10,
      name: 'Master Level',
      description: 'Clear 30 lines!',
      targetLines: 30,
      startingLevel: 5,
      fallSpeed: 400.0,
    ),
    LevelData(
      levelNumber: 11,
      name: 'Speed Demon',
      description: 'Clear 20 lines in 50 seconds!',
      targetLines: 20,
      timeLimit: 50,
      startingLevel: 6,
      fallSpeed: 300.0,
    ),
    LevelData(
      levelNumber: 12,
      name: 'Endurance',
      description: 'Clear 35 lines!',
      targetLines: 35,
      startingLevel: 6,
      fallSpeed: 350.0,
    ),
    LevelData(
      levelNumber: 13,
      name: 'Blitz',
      description: 'Clear 18 lines in 35 seconds!',
      targetLines: 18,
      timeLimit: 35,
      startingLevel: 7,
      fallSpeed: 250.0,
    ),
    LevelData(
      levelNumber: 14,
      name: 'Champion',
      description: 'Clear 40 lines!',
      targetLines: 40,
      startingLevel: 7,
      fallSpeed: 300.0,
    ),
    LevelData(
      levelNumber: 15,
      name: 'Ultra Fast',
      description: 'Clear 25 lines in 45 seconds!',
      targetLines: 25,
      timeLimit: 45,
      startingLevel: 8,
      fallSpeed: 200.0,
    ),
    LevelData(
      levelNumber: 16,
      name: 'Legend',
      description: 'Clear 50 lines!',
      targetLines: 50,
      startingLevel: 8,
      fallSpeed: 250.0,
    ),
    LevelData(
      levelNumber: 17,
      name: 'Extreme',
      description: 'Clear 30 lines in 40 seconds!',
      targetLines: 30,
      timeLimit: 40,
      startingLevel: 9,
      fallSpeed: 150.0,
    ),
    LevelData(
      levelNumber: 18,
      name: 'Epic',
      description: 'Clear 60 lines!',
      targetLines: 60,
      startingLevel: 9,
      fallSpeed: 200.0,
    ),
    LevelData(
      levelNumber: 19,
      name: 'Impossible',
      description: 'Clear 35 lines in 35 seconds!',
      targetLines: 35,
      timeLimit: 35,
      startingLevel: 10,
      fallSpeed: 100.0,
    ),
    LevelData(
      levelNumber: 20,
      name: 'Grand Master',
      description: 'Clear 100 lines!',
      targetLines: 100,
      startingLevel: 10,
      fallSpeed: 150.0,
    ),
  ];

  LevelData? getLevel(int levelNumber) {
    if (levelNumber < 1 || levelNumber > levels.length) return null;
    return levels[levelNumber - 1];
  }

  Future<int> getHighestUnlockedLevel() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('highest_unlocked_level') ?? 1;
  }

  Future<void> unlockLevel(int levelNumber) async {
    final prefs = await SharedPreferences.getInstance();
    final currentHighest = await getHighestUnlockedLevel();
    if (levelNumber > currentHighest) {
      await prefs.setInt('highest_unlocked_level', levelNumber);
    }
  }

  Future<bool> isLevelUnlocked(int levelNumber) async {
    final highestUnlocked = await getHighestUnlockedLevel();
    return levelNumber <= highestUnlocked;
  }
}

final adventureModeProvider = Provider<AdventureMode>((ref) {
  return AdventureMode();
});

