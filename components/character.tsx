import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { CharacterState } from '@/types/habit';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface CharacterProps {
  character: CharacterState;
}

export function Character({ character }: CharacterProps) {
  const t = useTranslations();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  const bounceAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    // Character bounce animation
    bounceAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    // Health bar pulse animation when low health
    if (character.health / character.maxHealth < 0.3) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    }
  }, [character.health, character.maxHealth]);

  const animatedCharacterStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            bounceAnimation.value,
            [0, 1],
            [0, -10]
          ),
        },
        {
          scale: interpolate(
            bounceAnimation.value,
            [0, 0.5, 1],
            [1, 1.05, 1]
          ),
        },
      ],
    };
  });

  const animatedHealthBarStyle = useAnimatedStyle(() => {
    const healthPercentage = character.health / character.maxHealth;
    return {
      opacity: healthPercentage < 0.3 ? 
        interpolate(pulseAnimation.value, [0, 1], [0.6, 1]) : 1,
    };
  });
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
      <Animated.View style={[styles.characterDisplay, animatedCharacterStyle]}>
        <Animated.Text style={styles.characterEmoji}>
          {getCharacterEmoji()}
        </Animated.Text>
        <ThemedText type="subtitle" style={styles.stateText}>
          {getStateText()}
        </ThemedText>
      </Animated.View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <ThemedText type="defaultSemiBold">{t.level}: {character.level}</ThemedText>
        </View>

        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>{t.health}</ThemedText>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${(character.health / character.maxHealth) * 100}%`,
                    backgroundColor: getHealthBarColor(),
                  },
                  animatedHealthBarStyle,
                ]}
              />
            </Animated.View>
            <ThemedText style={styles.statValue}>
              {character.health}/{character.maxHealth}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>{t.experience}</ThemedText>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
              <Animated.View
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