import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { Achievement } from '@/types/achievement';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AchievementModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

export function AchievementModal({ achievement, visible, onClose }: AchievementModalProps) {
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible && achievement) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 }, () => {
        if (!visible) {
          runOnJS(onClose)();
        }
      });
    }
  }, [visible, achievement]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (!achievement) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, animatedModalStyle]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View style={[
          styles.modal,
          { backgroundColor: cardBackground, borderColor },
          animatedContentStyle,
        ]}>
          <View style={styles.header}>
            <ThemedText style={styles.congratsText}>🎉 Вітаємо! 🎉</ThemedText>
            <ThemedText style={styles.achievementIcon}>{achievement.icon}</ThemedText>
            <ThemedText type="subtitle" style={styles.achievementName}>
              {achievement.name}
            </ThemedText>
            <ThemedText style={styles.achievementDescription}>
              {achievement.description}
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: primaryColor }]}
              onPress={onClose}
            >
              <ThemedText style={[styles.closeButtonText, { color: 'white' }]}>
                Продовжити
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  achievementIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  achievementName: {
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementDescription: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  closeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});