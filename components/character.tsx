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
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

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
  const breathAnimation = useSharedValue(0);
  const blinkAnimation = useSharedValue(0);

  React.useEffect(() => {
    // Character bounce animation
    bounceAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    // Breathing animation
    breathAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Blinking animation
    blinkAnimation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 100 }),
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      false
    );

    // Health bar pulse animation when low health
    if (character.health / character.maxHealth < 0.3) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    }
  }, [character.health, character.maxHealth, bounceAnimation, breathAnimation, blinkAnimation, pulseAnimation]);

  const animatedCharacterStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            bounceAnimation.value,
            [0, 1],
            [0, -8]
          ),
        },
        {
          scale: interpolate(
            breathAnimation.value,
            [0, 0.5, 1],
            [1, 1.02, 1]
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

  const getCharacterColor = () => {
    switch (character.state) {
      case 'strong':
        return primaryColor;
      case 'weak':
        return '#94a3b8';
      default:
        return '#3b82f6';
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

  const CharacterSVG = () => {
    const characterColor = getCharacterColor();
    const isWeak = character.state === 'weak';
    const isStrong = character.state === 'strong';

    return (
      <Svg width="120" height="140" viewBox="0 0 120 140">
        {/* Shadow */}
        <Ellipse cx="60" cy="135" rx="25" ry="5" fill="rgba(0,0,0,0.1)" />
        
        {/* Body */}
        <Ellipse 
          cx="60" 
          cy="100" 
          rx={isStrong ? "22" : isWeak ? "18" : "20"} 
          ry={isStrong ? "35" : isWeak ? "30" : "32"} 
          fill={characterColor} 
        />
        
        {/* Arms */}
        <Ellipse 
          cx={isStrong ? "35" : "38"} 
          cy="85" 
          rx={isStrong ? "8" : isWeak ? "5" : "6"} 
          ry={isStrong ? "20" : isWeak ? "15" : "18"} 
          fill={characterColor} 
        />
        <Ellipse 
          cx={isStrong ? "85" : "82"} 
          cy="85" 
          rx={isStrong ? "8" : isWeak ? "5" : "6"} 
          ry={isStrong ? "20" : isWeak ? "15" : "18"} 
          fill={characterColor} 
        />
        
        {/* Legs */}
        <Ellipse 
          cx="50" 
          cy="125" 
          rx={isStrong ? "7" : isWeak ? "5" : "6"} 
          ry={isStrong ? "18" : isWeak ? "12" : "15"} 
          fill={characterColor} 
        />
        <Ellipse 
          cx="70" 
          cy="125" 
          rx={isStrong ? "7" : isWeak ? "5" : "6"} 
          ry={isStrong ? "18" : isWeak ? "12" : "15"} 
          fill={characterColor} 
        />
        
        {/* Head */}
        <Circle 
          cx="60" 
          cy="45" 
          r={isStrong ? "25" : isWeak ? "20" : "22"} 
          fill="#fbbf24" 
        />
        
        {/* Eyes */}
        <Animated.View style={useAnimatedStyle(() => ({
          transform: [{ scaleY: blinkAnimation.value }]
        }))}>
          <Circle cx="52" cy="40" r="3" fill="#1f2937" />
          <Circle cx="68" cy="40" r="3" fill="#1f2937" />
        </Animated.View>
        
        {/* Mouth */}
        {isStrong && (
          <Path 
            d="M 50 55 Q 60 65 70 55" 
            stroke="#1f2937" 
            strokeWidth="2" 
            fill="none" 
          />
        )}
        {character.state === 'normal' && (
          <Path 
            d="M 52 55 Q 60 60 68 55" 
            stroke="#1f2937" 
            strokeWidth="2" 
            fill="none" 
          />
        )}
        {isWeak && (
          <Path 
            d="M 50 60 Q 60 50 70 60" 
            stroke="#1f2937" 
            strokeWidth="2" 
            fill="none" 
          />
        )}
        
        {/* Special effects for strong state */}
        {isStrong && (
          <>
            <Circle cx="45" cy="30" r="2" fill="#fbbf24" opacity="0.7" />
            <Circle cx="75" cy="35" r="1.5" fill="#fbbf24" opacity="0.7" />
            <Circle cx="40" cy="50" r="1" fill="#fbbf24" opacity="0.7" />
            <Circle cx="80" cy="45" r="1" fill="#fbbf24" opacity="0.7" />
          </>
        )}
        
        {/* Tired effects for weak state */}
        {isWeak && (
          <>
            <Path d="M 45 25 L 50 30 L 45 35" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5" />
            <Path d="M 75 25 L 70 30 L 75 35" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5" />
          </>
        )}
      </Svg>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.characterDisplay, animatedCharacterStyle]}>
        <CharacterSVG />
        <ThemedText type="subtitle" style={styles.stateText}>
          {getStateText()}
        </ThemedText>
        <ThemedText style={styles.levelText}>
          {t.level} {character.level}
        </ThemedText>
      </Animated.View>

      <View style={styles.statsContainer}>
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
  stateText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    opacity: 0.8,
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