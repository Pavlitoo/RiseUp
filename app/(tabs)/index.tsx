import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AchievementModal } from '@/components/achievement-modal';
import { BonusModal } from '@/components/bonus-modal';
import { CoinsDisplay } from '@/components/coins-display';
import { CustomHabitCard } from '@/components/custom-habits/custom-habit-card-component';
import { DailyStatsComponent } from '@/components/daily-stats';
import { ShopModal } from '@/components/shop-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAchievements } from '@/hooks/use-achievements';
import { useBonuses } from '@/hooks/use-bonuses';
import { useCoins } from '@/hooks/use-coins';
import { useCustomHabits } from '@/hooks/use-custom-habits';
import { useHabits } from '@/hooks/use-habits';
import { useStatistics } from '@/hooks/use-statistics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { character, dailyStats } = useHabits();
  const { habits: customHabits, getTotalProgress, toggleHabit, loading } = useCustomHabits();
  const { newUnlocked, clearNewUnlocked } = useAchievements();
  const { getUnclaimedCount, dailyBonus } = useBonuses();
  const { coins } = useCoins();
  const { statistics } = useStatistics();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const [showAchievement, setShowAchievement] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const headerOpacity = useSharedValue(0);
  
  const unclaimedBonuses = getUnclaimedCount;
  const hasDailyBonus = dailyBonus.available && !dailyBonus.claimed;
  const totalAvailableBonuses = unclaimedBonuses + (hasDailyBonus ? 1 : 0);
  
  // Calculate combined stats
  const totalHabits = customHabits.length;
  const completedHabits = customHabits.filter(h => h.completed).length;

  // Show achievement modal when new achievement is unlocked
  React.useEffect(() => {
    if (newUnlocked.length > 0) {
      setShowAchievement(true);
    }
  }, [newUnlocked]);

  const handleCloseAchievement = () => {
    setShowAchievement(false);
    clearNewUnlocked();
  };

  const handleShowBonuses = () => {
    setShowBonuses(true);
  };

  const handleCloseBonuses = () => {
    setShowBonuses(false);
  };

  const handleShowShop = () => {
    setShowShop(true);
  };

  const handleCloseShop = () => {
    setShowShop(false);
  };

  React.useEffect(() => {
    if (!loading) {
      headerOpacity.value = withTiming(1, { duration: 1000 });
    }
  }, [loading, headerOpacity]);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: (1 - headerOpacity.value) * -20,
        },
      ],
    };
  });

  // Якщо немає звичок, показуємо привітальний екран
  if (customHabits.length === 0) {
    return (
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.content}>
          <Animated.View style={[styles.welcomeContainer, animatedHeaderStyle]}>
            <ThemedText style={styles.welcomeIcon}>🌟</ThemedText>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Ласкаво просимо до RiseUp!
            </ThemedText>
            <ThemedText style={styles.welcomeDescription}>
              Почніть свій шлях до кращого життя, створивши свою першу звичку.
            </ThemedText>
            
            <Link href="/my-habits" style={styles.createHabitButton}>
              <ThemedView style={[styles.button, { backgroundColor: primaryColor }]}>
                <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                  ✨ Створити першу звичку
                </ThemedText>
              </ThemedView>
            </Link>
            
            <View style={styles.featuresPreview}>
              <CoinsDisplay 
                coins={coins} 
                onPress={handleShowShop}
              />
              
              <ThemedText type="subtitle" style={styles.featuresTitle}>
                Що вас чекає:
              </ThemedText>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <ThemedText style={styles.featureIcon}>🎯</ThemedText>
                  <ThemedText style={styles.featureText}>Персональні звички</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <ThemedText style={styles.featureIcon}>📊</ThemedText>
                  <ThemedText style={styles.featureText}>Детальна статистика</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <ThemedText style={styles.featureIcon}>🏆</ThemedText>
                  <ThemedText style={styles.featureText}>Досягнення та бонуси</ThemedText>
                </View>
                <View style={styles.featureItem}>
                  <ThemedText style={styles.featureIcon}>🎮</ThemedText>
                  <ThemedText style={styles.featureText}>Віртуальний персонаж</ThemedText>
                </View>
              </View>
            </View>
          </Animated.View>
        </ThemedView>
      </ScrollView>
    );
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <ThemedText type="title" style={styles.title}>
                🌟 RiseUp
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {t.myHabits}
              </ThemedText>
            </View>
            
            {totalAvailableBonuses > 0 && (
              <View style={styles.headerActions}>
                <CoinsDisplay 
                  coins={coins} 
                  onPress={handleShowShop}
                  compact
                />
                
              <TouchableOpacity
                style={[styles.bonusButton, { backgroundColor: primaryColor }]}
                onPress={handleShowBonuses}
              >
                <ThemedText style={[styles.bonusButtonText, { color: 'white' }]}>
                  🎁 {totalAvailableBonuses}
                </ThemedText>
              </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statText}>🔥</ThemedText>
              <ThemedText style={styles.statText}>
                {statistics.currentStreak} днів
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statText}>🎯</ThemedText>
              <ThemedText style={styles.statText}>
                Рівень {character.level}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statText}>✅</ThemedText>
              <ThemedText style={styles.statText}>
                {completedHabits}/{totalHabits}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statText}>⭐</ThemedText>
              <ThemedText style={styles.statText}>
                {statistics.totalExperience} XP
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(800)}>
          <DailyStatsComponent stats={dailyStats} />
        </Animated.View>

        <Animated.View 
          style={styles.habitsSection}
          entering={SlideInDown.delay(300).duration(800)}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t.myHabits}
          </ThemedText>
          
          {customHabits.slice(0, 3).map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeIn.delay(500 + (index * 100)).duration(600)}
            >
              <CustomHabitCard
                habit={habit}
                onToggle={toggleHabit}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </Animated.View>
          ))}
          
          {customHabits.length > 3 && (
            <Animated.View entering={FadeIn.delay(700).duration(600)}>
              <ThemedText style={styles.moreHabitsText}>
                ... та ще {customHabits.length - 3} звичок
              </ThemedText>
            </Animated.View>
          )}
          
          {customHabits.length > 0 && (
            <Animated.View entering={FadeIn.delay(700).duration(600)}>
              <Link href="/my-habits" style={styles.customHabitsLink}>
                <ThemedView style={[styles.customHabitsButton, { backgroundColor: primaryColor }]}>
                  <ThemedText style={[styles.customHabitsText, { color: 'white' }]}>
                    ✨ Керувати звичками ({customHabits.length})
                  </ThemedText>
                </ThemedView>
              </Link>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(600)}>
          <Link href="/progress" style={styles.progressButton}>
            <ThemedView style={[styles.button, { backgroundColor: primaryColor }]}>
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                {t.progress}
              </ThemedText>
            </ThemedView>
          </Link>
        </Animated.View>
      </ThemedView>
      
      <AchievementModal
        achievement={newUnlocked[0] || null}
        visible={showAchievement}
        onClose={handleCloseAchievement}
      />
      
      <BonusModal
        visible={showBonuses}
        onClose={handleCloseBonuses}
      />
      
      <ShopModal
        visible={showShop}
        onClose={handleCloseShop}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeDescription: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  createHabitButton: {
    marginBottom: 40,
  },
  featuresPreview: {
    width: '100%',
    paddingHorizontal: 20,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  header: {
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  bonusButton: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bonusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statIcon: {
    width: 16,
    height: 16,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  habitsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  moreHabitsText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  progressButton: {
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinsContainer: {
    marginTop: 8,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customHabitsLink: {
    marginTop: 16,
  },
  customHabitsButton: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  customHabitsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});