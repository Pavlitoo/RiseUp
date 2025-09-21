import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { DailyStats } from '@/types/habit';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DailyStatsProps {
  stats: DailyStats | null;
}

export function DailyStatsComponent({ stats }: DailyStatsProps) {
  const t = useTranslations();
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  if (!stats) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: cardBackground, borderColor }]}>
        <ThemedText type="subtitle" style={styles.title}>
          📊 {t.dailyStats}
        </ThemedText>
        <ThemedText style={styles.noData}>
          Start completing habits to see statistics!
        </ThemedText>
      </ThemedView>
    );
  }

  const completionRate = stats.totalHabits > 0 ? (stats.completedHabits / stats.totalHabits) * 100 : 0;

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground, borderColor }]}>
      <ThemedText type="subtitle" style={styles.title}>
        📊 {t.dailyStats}
      </ThemedText>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
            {stats.completedHabits}
          </ThemedText>
          <ThemedText style={styles.statLabel}>{t.completed}</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: secondaryColor }]}>
            {stats.totalHabits}
          </ThemedText>
          <ThemedText style={styles.statLabel}>{t.total}</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
            {Math.round(completionRate)}%
          </ThemedText>
          <ThemedText style={styles.statLabel}>{t.success}</ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: secondaryColor }]}>
            +{stats.experienceGained}
          </ThemedText>
          <ThemedText style={styles.statLabel}>{t.experienceGained}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  noData: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});