import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AchievementModal } from '@/components/achievement-modal';
import { DailyStatsComponent } from '@/components/daily-stats';
import { HabitCard } from '@/components/habit-card';
import { MotivationalQuote } from '@/components/motivational-quote';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAchievements } from '@/hooks/use-achievements';
import { useHabits } from '@/hooks/use-habits';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageKey, useTranslations } from '@/hooks/use-translations';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export default function HomeScreen() {
  const { habits, dailyStats, toggleHabit } = useHabits(); // Видалили loading
  const { newUnlocked, clearNewUnlocked } = useAchievements();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const languageKey = useLanguageKey();
  const [showAchievement, setShowAchievement] = useState(false);

  const headerOpacity = useSharedValue(0);

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
          <ThemedText type="title" style={styles.title}>
            🌟 RiseUp
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t.myHabits}
          </ThemedText>
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
        </Animated.View>

        <Animated.View entering={FadeIn.delay(800).duration(600)}>
          <Link href="/progress" style={styles.progressButton}>
            <ThemedView style={[styles.button, { backgroundColor: primaryColor }]}>
              <ThemedText style={[styles.buttonText, { color: 'white' }]}>
                {t.viewProgress}
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
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
});