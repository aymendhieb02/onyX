import 'package:shared_preferences/shared_preferences.dart';

class ClassicMode {
  static const String _highScoreKey = 'classic_high_score';

  Future<int> getHighScore() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_highScoreKey) ?? 0;
  }

  Future<void> saveHighScore(int score) async {
    final prefs = await SharedPreferences.getInstance();
    final currentHighScore = await getHighScore();
    if (score > currentHighScore) {
      await prefs.setInt(_highScoreKey, score);
    }
  }
}

