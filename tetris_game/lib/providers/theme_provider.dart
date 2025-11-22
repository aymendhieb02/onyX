import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../themes/theme_manager.dart';
import '../themes/theme_data.dart';

final themeProvider = StateNotifierProvider<ThemeNotifier, GameThemeData>((ref) {
  return ThemeNotifier();
});

class ThemeNotifier extends StateNotifier<GameThemeData> {
  ThemeNotifier() : super(ThemeManager.currentTheme) {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    await ThemeManager.loadTheme();
    state = ThemeManager.currentTheme;
  }

  Future<void> setTheme(GameTheme theme) async {
    await ThemeManager.setTheme(theme);
    state = ThemeManager.currentTheme;
  }
}

