import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AchievementModal } from '@/components/achievement-modal';
import { BonusModal } from '@/components/bonus-modal';
import { DailyStatsComponent } from '@/components/daily-stats';
import { HabitCard } from '@/components/habit-card';
import { MotivationalQuote } from '@/components/motivational-quote';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAchievements } from '@/hooks/use-achievements';
import { useBonuses } from '@/hooks/use-bonuses';
import { useCustomHabits } from '@/hooks/use-custom-habits';
import { useHabits } from '@/hooks/use-habits';
import { useStatistics } from '@/hooks/use-statistics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageKey, useTranslations } from '@/hooks/use-translations';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    SlideInDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { habits, dailyStats, toggleHabit } = useHabits(); // Видалили loading
  const { habits: customHabits, getTotalProgress } = useCustomHabits();
  const { newUnlocked, clearNewUnlocked } = useAchievements();
  const { getUnclaimedCount, getAvailableBonuses, dailyBonus } = useBonuses();
  const { statistics } = useStatistics();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const languageKey = useLanguageKey();
  const [showAchievement, setShowAchievement] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);

  const headerOpacity = useSharedValue(0);
  
  const unclaimedBonuses = getUnclaimedCount();
  const hasDailyBonus = dailyBonus.available && !dailyBonus.claimed;
  const totalAvailableBonuses = unclaimedBonuses + (hasDailyBonus ? 1 : 0);
  
  // Calculate combined stats
  const totalHabits = habits.length + customHabits.length;
  const completedHabits = habits.filter(h => h.completed).length + customHabits.filter(h => h.completed).length;

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

  React.useEffect(() => {
    // Завжди показуємо анімацію, оскільки loading більше немає
    headerOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

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

  return (
    <ScrollView key={languageKey} style={[styles.container, { backgroundColor }]}>
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
              <TouchableOpacity
                style={[styles.bonusButton, { backgroundColor: primaryColor }]}
                onPress={handleShowBonuses}
              >
                <ThemedText style={[styles.bonusButtonText, { color: 'white' }]}>
                  🎁 {totalAvailableBonuses}
                </ThemedText>
              </TouchableOpacity>
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
                Рівень {statistics.totalDays > 0 ? Math.floor(statistics.totalExperience / 100) + 1 : 1}
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

        <Animated.View entering={FadeIn.delay(300).duration(800)}>
          <MotivationalQuote />
        </Animated.View>

        <Animated.View 
          style={styles.habitsSection}
          entering={SlideInDown.delay(400).duration(800)}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t.myHabits}
          </ThemedText>
          
          {habits.map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeIn.delay(600 + index * 100).duration(600)}
            >
              <HabitCard
                habit={habit}
                onToggle={toggleHabit}
              />
            </Animated.View>
          ))}
          
          {customHabits.length > 0 && (
            <Animated.View entering={FadeIn.delay(800).duration(600)}>
              <Link href="/my-habits" style={styles.customHabitsLink}>
                <ThemedView style={[styles.customHabitsButton, { backgroundColor: primaryColor }]}>
                  <ThemedText style={[styles.customHabitsText, { color: 'white' }]}>
                    ✨ Переглянути мої звички ({customHabits.length})
                  </ThemedText>
                </ThemedView>
              </Link>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(800).duration(600)}>
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