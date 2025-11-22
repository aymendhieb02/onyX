import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/game_engine.dart';
import '../core/game_board.dart';
import '../core/power_up_system.dart';

final gameBoardProvider = Provider<GameBoard>((ref) {
  return GameBoard();
});

final gameEngineProvider = Provider<GameEngine>((ref) {
  final board = ref.watch(gameBoardProvider);
  final engine = GameEngine(board: board);
  ref.onDispose(() => engine.dispose());
  return engine;
});

final powerUpManagerProvider = Provider<PowerUpManager>((ref) {
  final engine = ref.watch(gameEngineProvider);
  final board = ref.watch(gameBoardProvider);
  final manager = PowerUpManager(engine: engine, board: board);
  ref.onDispose(() => manager.dispose());
  return manager;
});

