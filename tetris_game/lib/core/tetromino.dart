import 'dart:math';
import 'package:flutter/material.dart';

enum TetrominoType { I, O, T, S, Z, J, L }

class Tetromino {
  final TetrominoType type;
  final List<List<int>> shape;
  final Color color;
  int rotation = 0;

  Tetromino({
    required this.type,
    required this.shape,
    required this.color,
  });

  // Get all rotation states for this tetromino
  List<List<List<int>>> get rotations {
    switch (type) {
      case TetrominoType.I:
        return [
          [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
          ],
        ];
      case TetrominoType.O:
        return [
          [
            [1, 1],
            [1, 1],
          ],
        ];
      case TetrominoType.T:
        return [
          [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
          ],
          [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
          ],
          [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
          ],
          [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
          ],
        ];
      case TetrominoType.S:
        return [
          [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
          ],
          [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1],
          ],
        ];
      case TetrominoType.Z:
        return [
          [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
          ],
          [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0],
          ],
        ];
      case TetrominoType.J:
        return [
          [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
          ],
          [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
          ],
          [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1],
          ],
          [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0],
          ],
        ];
      case TetrominoType.L:
        return [
          [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
          ],
          [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
          ],
          [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0],
          ],
          [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
          ],
        ];
    }
  }

  List<List<int>> get currentShape {
    final rots = rotations;
    return rots[rotation % rots.length];
  }

  void rotate() {
    rotation = (rotation + 1) % rotations.length;
  }

  void rotateCounterClockwise() {
    rotation = (rotation - 1 + rotations.length) % rotations.length;
  }

  Tetromino copy() {
    return Tetromino(type: type, shape: shape, color: color)..rotation = rotation;
  }

  static Tetromino random() {
    final random = Random();
    final types = TetrominoType.values;
    final type = types[random.nextInt(types.length)];
    return Tetromino(
      type: type,
      shape: [],
      color: _getColorForType(type),
    );
  }

  static Color _getColorForType(TetrominoType type) {
    switch (type) {
      case TetrominoType.I:
        return Colors.cyan;
      case TetrominoType.O:
        return Colors.yellow;
      case TetrominoType.T:
        return Colors.purple;
      case TetrominoType.S:
        return Colors.green;
      case TetrominoType.Z:
        return Colors.red;
      case TetrominoType.J:
        return Colors.blue;
      case TetrominoType.L:
        return Colors.orange;
    }
  }
}

