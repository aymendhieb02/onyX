import 'package:flutter/material.dart';

enum AvatarType {
  hero,
  princess,
  robot,
  unicorn,
  dragon,
  wizard,
}

class Avatar {
  final AvatarType type;
  final String name;
  final String emoji;
  final Color color;
  final List<String> phrases;

  Avatar({
    required this.type,
    required this.name,
    required this.emoji,
    required this.color,
    required this.phrases,
  });

  static Avatar fromType(AvatarType type) {
    switch (type) {
      case AvatarType.hero:
        return Avatar(
          type: type,
          name: 'Super Hero',
          emoji: '🦸',
          color: Colors.blue,
          phrases: [
            'You\'re amazing!',
            'Keep going!',
            'You\'re a star!',
          ],
        );
      case AvatarType.princess:
        return Avatar(
          type: type,
          name: 'Princess',
          emoji: '👸',
          color: Colors.pink,
          phrases: [
            'Wonderful!',
            'You\'re doing great!',
            'Fantastic!',
          ],
        );
      case AvatarType.robot:
        return Avatar(
          type: type,
          name: 'Robot',
          emoji: '🤖',
          color: Colors.grey,
          phrases: [
            'Excellent!',
            'Perfect move!',
            'Outstanding!',
          ],
        );
      case AvatarType.unicorn:
        return Avatar(
          type: type,
          name: 'Unicorn',
          emoji: '🦄',
          color: Colors.purple,
          phrases: [
            'Magical!',
            'You\'re incredible!',
            'Amazing!',
          ],
        );
      case AvatarType.dragon:
        return Avatar(
          type: type,
          name: 'Dragon',
          emoji: '🐉',
          color: Colors.red,
          phrases: [
            'Fire!',
            'You\'re powerful!',
            'Awesome!',
          ],
        );
      case AvatarType.wizard:
        return Avatar(
          type: type,
          name: 'Wizard',
          emoji: '🧙',
          color: Colors.indigo,
          phrases: [
            'Brilliant!',
            'You\'re magical!',
            'Wonderful!',
          ],
        );
    }
  }

  static List<Avatar> getAllAvatars() {
    return AvatarType.values.map((type) => Avatar.fromType(type)).toList();
  }
}

