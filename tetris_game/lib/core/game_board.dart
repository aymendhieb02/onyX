import 'dart:math';
import 'package:flutter/material.dart';
import 'tetromino.dart';

class GameBoard {
  static const int width = 10;
  static const int height = 20;

  List<List<Color?>> grid;
  List<Point<int>> placedBlocks = [];

  GameBoard() : grid = List.generate(height, (_) => List.filled(width, null)) {
    placedBlocks = [];
  }

  bool isValidPosition(Tetromino tetromino, int x, int y) {
    final shape = tetromino.currentShape;
    for (int row = 0; row < shape.length; row++) {
      for (int col = 0; col < shape[row].length; col++) {
        if (shape[row][col] == 1) {
          final newX = x + col;
          final newY = y + row;

          // Check boundaries
          if (newX < 0 || newX >= width || newY >= height) {
            return false;
          }

          // Check if position is already occupied
          if (newY >= 0 && grid[newY][newX] != null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  bool placeTetromino(Tetromino tetromino, int x, int y) {
    if (!isValidPosition(tetromino, x, y)) {
      return false;
    }

    final shape = tetromino.currentShape;
    for (int row = 0; row < shape.length; row++) {
      for (int col = 0; col < shape[row].length; col++) {
        if (shape[row][col] == 1) {
          final newX = x + col;
          final newY = y + row;
          if (newY >= 0) {
            grid[newY][newX] = tetromino.color;
            placedBlocks.add(Point(newX, newY));
          }
        }
      }
    }
    return true;
  }

  List<int> clearLines() {
    List<int> clearedLines = [];
    for (int row = height - 1; row >= 0; row--) {
      if (grid[row].every((cell) => cell != null)) {
        clearedLines.add(row);
        grid.removeAt(row);
        grid.insert(0, List.filled(width, null));
        row++; // Check the same row again
      }
    }

    // Update placed blocks
    placedBlocks.clear();
    for (int row = 0; row < height; row++) {
      for (int col = 0; col < width; col++) {
        if (grid[row][col] != null) {
          placedBlocks.add(Point(col, row));
        }
      }
    }

    return clearedLines;
  }

  bool isGameOver() {
    // Check if top rows have any blocks
    for (int row = 0; row < 2; row++) {
      for (int col = 0; col < width; col++) {
        if (grid[row][col] != null) {
          return true;
        }
      }
    }
    return false;
  }

  void reset() {
    grid = List.generate(height, (_) => List.filled(width, null));
    placedBlocks.clear();
  }

  void addGarbageLines(int count) {
    final random = Random();
    for (int i = 0; i < count; i++) {
      grid.removeAt(0);
      final garbageLine = List<Color?>.filled(width, Colors.grey);
      final holeIndex = random.nextInt(width);
      garbageLine[holeIndex] = null;
      grid.add(garbageLine);
    }
  }
}

