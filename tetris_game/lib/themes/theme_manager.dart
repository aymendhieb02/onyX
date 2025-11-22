import 'package:shared_preferences/shared_preferences.dart';
import 'theme_data.dart';

class ThemeManager {
  static const String _themeKey = 'selected_theme';
  static GameThemeData _currentTheme = GameThemeData.fromTheme(GameTheme.space);

  static GameThemeData get currentTheme => _currentTheme;

  static Future<void> loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final themeIndex = prefs.getInt(_themeKey) ?? 0;
    if (themeIndex >= 0 && themeIndex < GameTheme.values.length) {
      _currentTheme = GameThemeData.fromTheme(GameTheme.values[themeIndex]);
    }
  }

  static Future<void> setTheme(GameTheme theme) async {
    _currentTheme = GameThemeData.fromTheme(theme);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_themeKey, theme.index);
  }
}

