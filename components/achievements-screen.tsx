import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAchievements } from '@/hooks/use-achievements';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function AchievementsScreen() {
  const { achievements } = useAchievements();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const AchievementCard = ({ achievement, index }: { achievement: any; index: number }) => (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(600)}
      style={[
        styles.achievementCard,
        {
          backgroundColor: cardBackground,
          borderColor: achievement.unlocked ? primaryColor : borderColor,
          opacity: achievement.unlocked ? 1 : 0.6,
        },
      ]}
    >
      <View style={styles.achievementContent}>
        <ThemedText style={[
          styles.achievementIcon,
          { opacity: achievement.unlocked ? 1 : 0.5 }
        ]}>
          {achievement.icon}
        </ThemedText>
        <View style={styles.achievementInfo}>
          <ThemedText type="defaultSemiBold" style={styles.achievementName}>
            {achievement.name}
            {achievement.unlocked && <ThemedText style={{ color: primaryColor }}> ✓</ThemedText>}
          </ThemedText>
          <ThemedText style={styles.achievementDescription}>
            {achievement.description}
          </ThemedText>
          {!achievement.unlocked && achievement.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(achievement.progress / achievement.requirement) * 100}%`,
                      backgroundColor: primaryColor,
                    },
                  ]}
                />
              </View>
              <ThemedText style={styles.progressText}>
                {achievement.progress}/{achievement.requirement}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🏆 Досягнення
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {unlockedAchievements.length} з {achievements.length} розблоковано
          </ThemedText>
        </View>

        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              ✨ Розблоковані
            </ThemedText>
            {unlockedAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </View>
        )}

        {lockedAchievements.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              🔒 Заблоковані
            </ThemedText>
            {lockedAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index + unlockedAchievements.length}
              />
            ))}
          </View>
        )}
      </ThemedView>
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
    marginBottom: 30,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
    minWidth: 40,
  },
});