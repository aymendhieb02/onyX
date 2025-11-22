import 'dart:math';

class MotivationalMessages {
  static final List<String> _generalMessages = [
    'Awesome! 🎉',
    'You\'re doing great! ⭐',
    'Keep it up! 💪',
    'Fantastic! 🌟',
    'Amazing! 🚀',
    'You\'re a star! ⭐',
    'Incredible! 🎊',
    'Super job! 🦸',
    'Way to go! 🎯',
    'Brilliant! ✨',
  ];

  static final List<String> _lineClearMessages = [
    'Line cleared! 🎉',
    'Perfect! ⭐',
    'Excellent! 🌟',
    'Great job! 💪',
    'Awesome clear! 🚀',
    'Fantastic! 🎊',
    'You\'re amazing! ⭐',
    'Super clear! 🦸',
    'Brilliant! ✨',
    'Outstanding! 🎯',
  ];

  static final List<String> _multiLineMessages = [
    'Double! Amazing! 🎉🎉',
    'Triple! Incredible! ⭐⭐⭐',
    'TETRIS! You\'re a legend! 🏆',
    'Wow! Multiple lines! 🌟',
    'Unbelievable! 🚀',
    'You\'re unstoppable! 💪',
    'Legendary! 🎊',
    'Perfect combo! ⭐',
    'Masterful! 🦸',
    'Out of this world! 🌌',
  ];

  static final List<String> _levelUpMessages = [
    'Level up! 🎉',
    'You\'re getting better! ⭐',
    'New level unlocked! 🌟',
    'Level up! Keep going! 💪',
    'You\'re advancing! 🚀',
    'Level up! Amazing! 🎊',
    'You\'re leveling up! ⭐',
    'New challenge! 🦸',
    'Level up! Brilliant! ✨',
    'You\'re progressing! 🎯',
  ];

  static final List<String> _powerUpMessages = [
    'Power-up activated! ⚡',
    'Special power! 🌟',
    'You got a boost! 🚀',
    'Power-up! Use it well! 💪',
    'Special ability! ⭐',
    'Power-up! Amazing! 🎊',
    'You\'re powered up! ⚡',
    'Special move! 🦸',
    'Power-up! Brilliant! ✨',
    'You\'re supercharged! 🎯',
  ];

  static final Random _random = Random();

  static String getRandomGeneral() {
    return _generalMessages[_random.nextInt(_generalMessages.length)];
  }

  static String getRandomLineClear() {
    return _lineClearMessages[_random.nextInt(_lineClearMessages.length)];
  }

  static String getMultiLine(int lines) {
    if (lines >= 4) {
      return _multiLineMessages[2]; // TETRIS message
    } else if (lines == 3) {
      return _multiLineMessages[1]; // Triple message
    } else if (lines == 2) {
      return _multiLineMessages[0]; // Double message
    }
    return getRandomLineClear();
  }

  static String getRandomLevelUp() {
    return _levelUpMessages[_random.nextInt(_levelUpMessages.length)];
  }

  static String getRandomPowerUp() {
    return _powerUpMessages[_random.nextInt(_powerUpMessages.length)];
  }
}

