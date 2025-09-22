import { ThemedText } from '@/components/themed-text';
import { useBonuses } from '@/hooks/use-bonuses';
import { useCoins } from '@/hooks/use-coins';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const warningColor = useThemeColor({}, 'warning');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [claimedBonuses, setClaimedBonuses] = useState<string[]>([]);

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
      setClaimedBonuses([]);
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
    
    const bonus = availableBonuses.find(b => b.id === bonusId);
    if (bonus?.reward.coins) {
      addCoins(bonus.reward.coins);
    }
    
    claimBonus(bonusId);
    setClaimedBonuses(prev => [...prev, bonusId]);
  };

  const handleClaimDailyBonus = () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const coinsReward = 50 * dailyBonus.multiplier;
    addCoins(coinsReward);
    
    claimDailyBonus();
    setClaimedBonuses(prev => [...prev, 'daily_bonus']);
  };

  if (!visible) return null;

  // Якщо немає доступних бонусів
  if (availableBonuses.length === 0 && !hasDailyBonus) {
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
                Поки що немає доступних бонусів
              </ThemedText>
            </View>

            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyIcon}>😔</ThemedText>
              <ThemedText style={styles.emptyTitle}>Немає бонусів</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Продовжуйте виконувати звички, щоб розблокувати нові бонуси та винагороди!
              </ThemedText>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: primaryColor }]}
                onPress={onClose}
              >
                <ThemedText style={[styles.closeButtonText, { color: primaryColor }]}>
                  Зрозуміло
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {hasDailyBonus && !claimedBonuses.includes('daily_bonus') && (
              <View style={[styles.bonusCard, styles.dailyBonusCard, { borderColor: warningColor }]}>
                <View style={styles.bonusHeader}>
                  <ThemedText style={styles.bonusIcon}>🌟</ThemedText>
                  <View style={styles.bonusHeaderText}>
                    <ThemedText type="defaultSemiBold" style={styles.bonusName}>
                      Щоденний бонус
                    </ThemedText>
                    <ThemedText style={[styles.bonusType, { color: warningColor }]}>
                      СПЕЦІАЛЬНА ПРОПОЗИЦІЯ
                    </ThemedText>
                  </View>
                </View>
                
                <ThemedText style={styles.bonusDescription}>
                  Серія: {dailyBonus.streak} днів (множник x{dailyBonus.multiplier})
                </ThemedText>
                
                <View style={styles.rewardContainer}>
                  <View style={styles.rewardItem}>
                    <ThemedText style={styles.rewardIcon}>⭐</ThemedText>
                    <ThemedText style={styles.rewardText}>
                      +{50 * dailyBonus.multiplier} досвіду
                    </ThemedText>
                  </View>
                  <View style={styles.rewardItem}>
                    <ThemedText style={styles.rewardIcon}>🪙</ThemedText>
                    <ThemedText style={styles.rewardText}>
                      +{50 * dailyBonus.multiplier} монет
                    </ThemedText>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.claimButton, { backgroundColor: warningColor }]}
                  onPress={handleClaimDailyBonus}
                >
                  <ThemedText style={[styles.claimButtonText, { color: 'white' }]}>
                    ✨ Отримати бонус
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {availableBonuses.map((bonus: {
              id: string;
              icon: string;
              name: string;
              description: string;
              type: string;
              reward: {
                experience: number;
                healthBoost?: number;
                specialEffect?: string;
                coins?: number;
              };
            }) => {
              const isClaimed = claimedBonuses.includes(bonus.id);
              
              return (
                <View key={bonus.id} style={[
                  styles.bonusCard, 
                  { 
                    borderColor: isClaimed ? '#10b981' : borderColor,
                    opacity: isClaimed ? 0.7 : 1 
                  }
                ]}>
                  <View style={styles.bonusHeader}>
                    <ThemedText style={styles.bonusIcon}>{bonus.icon}</ThemedText>
                    <View style={styles.bonusHeaderText}>
                      <ThemedText type="defaultSemiBold" style={styles.bonusName}>
                        {bonus.name}
                        {isClaimed && <ThemedText style={{ color: '#10b981' }}> ✓</ThemedText>}
                      </ThemedText>
                      <ThemedText style={[styles.bonusType, { color: primaryColor }]}>
                        {bonus.type === 'daily' && 'ЩОДЕННИЙ'}
                        {bonus.type === 'weekly' && 'ТИЖНЕВИЙ'}
                        {bonus.type === 'streak' && 'ЗА СЕРІЮ'}
                        {bonus.type === 'achievement' && 'ДОСЯГНЕННЯ'}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <ThemedText style={styles.bonusDescription}>
                    {bonus.description}
                  </ThemedText>
                  
                  <View style={styles.rewardContainer}>
                    <View style={styles.rewardItem}>
                      <ThemedText style={styles.rewardIcon}>⭐</ThemedText>
                      <ThemedText style={styles.rewardText}>
                        +{bonus.reward.experience} досвіду
                      </ThemedText>
                    </View>
                    {bonus.reward.healthBoost && (
                      <View style={styles.rewardItem}>
                        <ThemedText style={styles.rewardIcon}>❤️</ThemedText>
                        <ThemedText style={styles.rewardText}>
                          +{bonus.reward.healthBoost} здоров'я
                        </ThemedText>
                      </View>
                    )}
                    {bonus.reward.coins && (
                      <View style={styles.rewardItem}>
                        <ThemedText style={styles.rewardIcon}>🪙</ThemedText>
                        <ThemedText style={styles.rewardText}>
                          +{bonus.reward.coins} монет
                        </ThemedText>
                      </View>
                    )}
                    {bonus.reward.specialEffect && (
                      <View style={styles.rewardItem}>
                        <ThemedText style={styles.rewardIcon}>✨</ThemedText>
                        <ThemedText style={styles.rewardText}>
                          Спеціальний ефект
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.claimButton, 
                      { 
                        backgroundColor: isClaimed ? '#10b981' : primaryColor,
                        opacity: isClaimed ? 0.7 : 1
                      }
                    ]}
                    onPress={() => handleClaimBonus(bonus.id)}
                    disabled={isClaimed}
                  >
                    <ThemedText style={[styles.claimButtonText, { color: 'white' }]}>
                      {isClaimed ? '✓ Отримано' : '🎁 Отримати'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

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
    width: '95%',
    maxWidth: 450,
    maxHeight: '90%',
    minHeight: '60%',
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
    fontSize: 14,
  },
  content: {
    maxHeight: 400,
    padding: 20,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 200,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  bonusCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyBonusCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bonusIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  bonusHeaderText: {
    flex: 1,
  },
  bonusName: {
    fontSize: 15,
    marginBottom: 3,
  },
  bonusType: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bonusDescription: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 10,
    lineHeight: 16,
  },
  rewardContainer: {
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 6,
    width: 18,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  claimButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});