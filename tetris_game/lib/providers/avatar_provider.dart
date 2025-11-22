import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../features/avatars.dart';

final avatarProvider = StateNotifierProvider<AvatarNotifier, Avatar>((ref) {
  return AvatarNotifier();
});

class AvatarNotifier extends StateNotifier<Avatar> {
  AvatarNotifier() : super(Avatar.fromType(AvatarType.hero)) {
    _loadAvatar();
  }

  Future<void> _loadAvatar() async {
    final prefs = await SharedPreferences.getInstance();
    final avatarIndex = prefs.getInt('selected_avatar') ?? 0;
    if (avatarIndex >= 0 && avatarIndex < AvatarType.values.length) {
      state = Avatar.fromType(AvatarType.values[avatarIndex]);
    }
  }

  Future<void> setAvatar(AvatarType type) async {
    state = Avatar.fromType(type);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('selected_avatar', type.index);
  }
}

