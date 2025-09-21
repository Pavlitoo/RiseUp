import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { CharacterState } from '@/types/habit';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface CharacterProps {
  character: CharacterState;
}

export function Character({ character }: CharacterProps) {
  const t = useTranslations();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  const getCharacterEmoji = () => {
    switch (character.state) {
      case 'strong':
        return '💪😊';
      case 'weak':
        return '😴💤';
      default:
        return '🙂👍';
    }
  };

  const getHealthBarColor = () => {
    const healthPercentage = character.health / character.maxHealth;
    if (healthPercentage > 0.7) return primaryColor;
    if (healthPercentage > 0.4) return warningColor;
    return errorColor;
  };

  const getStateText = () => {
    switch (character.state) {
      case 'strong':
        return t.strong;
      case 'weak':
        return t.weak;
      default:
        return t.normal;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.characterDisplay}>
        <ThemedText style={styles.characterEmoji}>
          {getCharacterEmoji()}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.stateText}>
          {getStateText()}
        </ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <ThemedText type="defaultSemiBold">{t.level}: {character.level}</ThemedText>
        </View>

        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>{t.health}</ThemedText>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(character.health / character.maxHealth) * 100}%`,
                    backgroundColor: getHealthBarColor(),
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.statValue}>
              {character.health}/{character.maxHealth}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>{t.experience}</ThemedText>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(character.experience / character.maxExperience) * 100}%`,
                    backgroundColor: secondaryColor,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.statValue}>
              {character.experience}/{character.maxExperience}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  characterDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  stateText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  statsContainer: {
    width: '100%',
    gap: 16,
  },
  statRow: {
    width: '100%',
  },
  statLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  statValue: {
    fontSize: 14,
    minWidth: 60,
    textAlign: 'right',
  },
});