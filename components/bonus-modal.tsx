import { ThemedText } from '@/components/themed-text';
import { useBonuses } from '@/hooks/use-bonuses';
import { useCoins } from '@/hooks/use-coins';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface BonusModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BonusModal({ visible, onClose }: BonusModalProps) {
  const { getAvailableBonuses, claimBonus, claimDailyBonus, dailyBonus } = useBonuses();
  const { addCoins } = useCoins();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const celebrationScale = useSharedValue(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const animatedCelebrationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: celebrationScale.value }],
      opacity: celebrationScale.value,
    };
  });

  const availableBonuses = getAvailableBonuses();
  const hasDailyBonus = dailyBonus.available && !dailyBonus.claimed;

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

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

  const handleClaimBonus = (bonusId: string) => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    claimBonus(bonusId);
  };

  const handleClaimDailyBonus = () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    claimDailyBonus();
  };

  if (!visible || (availableBonuses.length === 0 && !hasDailyBonus)) return null;

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
            <ThemedText type="title" style={styles.title}>🎁 Бонуси</ThemedText>
            <ThemedText style={styles.subtitle}>
              Отримай винагороди за свої досягнення!
            </ThemedText>
          </View>

          <View style={styles.content}>
            {hasDailyBonus && (
              <View style={[styles.bonusCard, { borderColor: primaryColor }]}>
                <View style={styles.bonusInfo}>
                  <ThemedText style={styles.bonusIcon}>🌟</ThemedText>
                  <View style={styles.bonusDetails}>
                    <ThemedText type="defaultSemiBold" style={styles.bonusName}>
                      Щоденний бонус
                    </ThemedText>
                    <ThemedText style={styles.bonusDescription}>
                      Серія: {dailyBonus.streak} днів (x{dailyBonus.multiplier})
                    </ThemedText>
                    <ThemedText style={styles.bonusReward}>
                      +{50 * dailyBonus.multiplier} досвіду +{50 * dailyBonus.multiplier} монет
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.claimButton, { backgroundColor: primaryColor }]}
                  onPress={handleClaimDailyBonus}
                >
                  <ThemedText style={[styles.claimButtonText, { color: 'white' }]}>
                    Отримати
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {availableBonuses.map((bonus: {
              id: string;
              icon: string;
              name: string;
              description: string;
              reward: {
                experience: number;
                healthBoost?: number;
                specialEffect?: string;
                coins?: number;
              };
            }) => (
              <View key={bonus.id} style={[styles.bonusCard, { borderColor }]}>
                <View style={styles.bonusInfo}>
                  <ThemedText style={styles.bonusIcon}>{bonus.icon}</ThemedText>
                  <View style={styles.bonusDetails}>
                    <ThemedText type="defaultSemiBold" style={styles.bonusName}>
                      {bonus.name}
                    </ThemedText>
                    <ThemedText style={styles.bonusDescription}>
                      {bonus.description}
                    </ThemedText>
                    <ThemedText style={styles.bonusReward}>
                      +{bonus.reward.experience} досвіду
                      {bonus.reward.healthBoost && ` +${bonus.reward.healthBoost} здоров'я`}
                      {bonus.reward.coins && ` +${bonus.reward.coins} монет`}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.claimButton, { backgroundColor: primaryColor }]}
                  onPress={() => handleClaimBonus(bonus.id)}
                >
                  <ThemedText style={[styles.claimButtonText, { color: 'white' }]}>
                    Отримати
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: primaryColor }]}
              onPress={onClose}
            >
              <ThemedText style={[styles.closeButtonText, { color: primaryColor }]}>
                Закрити
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {showCelebration && (
          <Animated.View style={[styles.celebration, animatedCelebrationStyle]}>
            <ThemedText style={styles.celebrationText}>🎉 Вітаємо! 🎉</ThemedText>
            <ThemedText style={styles.celebrationSubtext}>Бонус отримано!</ThemedText>
          </Animated.View>
        )}
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
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  bonusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bonusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bonusDetails: {
    flex: 1,
  },
  bonusName: {
    fontSize: 16,
    marginBottom: 4,
  },
  bonusDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  bonusReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  claimButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  closeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  celebration: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 200,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  celebrationSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
});