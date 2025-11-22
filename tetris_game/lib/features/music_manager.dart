import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MusicManager {
  static final MusicManager _instance = MusicManager._internal();
  factory MusicManager() => _instance;
  MusicManager._internal();

  final AudioPlayer _backgroundPlayer = AudioPlayer();
  final AudioPlayer _soundEffectPlayer = AudioPlayer();
  bool _musicEnabled = true;
  bool _soundsEnabled = true;
  bool _isPlaying = false;

  Future<void> initialize() async {
    final prefs = await SharedPreferences.getInstance();
    _musicEnabled = prefs.getBool('music_enabled') ?? true;
    _soundsEnabled = prefs.getBool('sounds_enabled') ?? true;
  }

  Future<void> playBackgroundMusic() async {
    if (!_musicEnabled || _isPlaying) return;
    
    try {
      // Note: You'll need to add music files to assets/sounds/
      // For now, we'll use a placeholder approach
      // Uncomment when you have music files:
      // await _backgroundPlayer.play(AssetSource('sounds/background_music.mp3'));
      // await _backgroundPlayer.setReleaseMode(ReleaseMode.loop);
      _isPlaying = true;
    } catch (e) {
      // Music file not found - that's okay, we'll continue without it
      _isPlaying = false;
    }
  }

  Future<void> stopBackgroundMusic() async {
    await _backgroundPlayer.stop();
    _isPlaying = false;
  }

  Future<void> playSoundEffect(String soundName) async {
    if (!_soundsEnabled) return;
    
    try {
      // Uncomment when you have sound files:
      // await _soundEffectPlayer.play(AssetSource('sounds/$soundName.mp3'));
    } catch (e) {
      // Sound file not found - continue silently
    }
  }

  Future<void> setMusicEnabled(bool enabled) async {
    _musicEnabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('music_enabled', enabled);
    if (!enabled) {
      await stopBackgroundMusic();
    } else {
      await playBackgroundMusic();
    }
  }

  Future<void> setSoundsEnabled(bool enabled) async {
    _soundsEnabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('sounds_enabled', enabled);
  }

  bool get musicEnabled => _musicEnabled;
  bool get soundsEnabled => _soundsEnabled;

  void dispose() {
    _backgroundPlayer.dispose();
    _soundEffectPlayer.dispose();
  }
}

