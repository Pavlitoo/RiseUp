import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Character } from '@/components/character';
import { DailyStatsComponent } from '@/components/daily-stats';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHabits } from '@/hooks/use-habits';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';

export default function ProgressScreen() {
  const { character, dailyStats } = useHabits(); // Видалили loading
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t.yourProgress}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t.characterDevelopment}
          </ThemedText>
        </View>

        <ThemedView style={[styles.characterContainer, { backgroundColor: cardBackground, borderColor }]}>
          <Character character={character} />
        </ThemedView>

        <DailyStatsComponent stats={dailyStats} />

        <ThemedView style={[styles.tipsContainer, { backgroundColor: cardBackground, borderColor }]}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>
            {t.tips}
          </ThemedText>
          <View style={styles.tipsList}>
            <ThemedText style={styles.tip}>
              {t.tip1}
            </ThemedText>
            <ThemedText style={styles.tip}>
              {t.tip2}
            </ThemedText>
            <ThemedText style={styles.tip}>
              {t.tip3}
            </ThemedText>
            <ThemedText style={styles.tip}>
              {t.tip4}
            </ThemedText>
          </View>
        </ThemedView>

        <Link href="/" style={styles.backButton}>
          <ThemedView style={[styles.button, { backgroundColor: primaryColor }]}>
            <ThemedText style={[styles.buttonText, { color: 'white' }]}>
              {t.backToHabits}
            </ThemedText>
          </ThemedView>
        </Link>
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
  characterContainer: {
    borderRadius: 16,
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
  tipsContainer: {
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
  tipsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  backButton: {
    marginTop: 20,
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