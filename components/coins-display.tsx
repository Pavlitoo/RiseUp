import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface CoinsDisplayProps {
  coins: number;
  onPress?: () => void;
  compact?: boolean;
}

export function CoinsDisplay({ coins, onPress, compact = false }: CoinsDisplayProps) {
  const t = useTranslations();
  const primaryColor = useThemeColor({}, 'primary');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    onPress?.();
  };

  if (compact) {
    return (
      <TouchableOpacity onPress={handlePress} disabled={!onPress}>
        <Animated.View style={[
          styles.compactContainer,
          { backgroundColor: cardBackground, borderColor },
          animatedStyle,
        ]}>
          <ThemedText style={styles.coinIcon}>🪙</ThemedText>
          <ThemedText style={[styles.compactCoins, { color: primaryColor }]}>
            {coins.toLocaleString()}
          </ThemedText>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={!onPress}>
      <Animated.View style={[
        styles.container,
        { backgroundColor: cardBackground, borderColor },
        animatedStyle,
      ]}>
        <ThemedText style={styles.coinIcon}>🪙</ThemedText>
        <ThemedText style={[styles.coinsText, { color: primaryColor }]}>
          {coins.toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.label}>{t.coins}</ThemedText>
        {onPress && (
          <ThemedText style={[styles.shopHint, { color: primaryColor }]}>
            {t.shop} →
          </ThemedText>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    gap: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    gap: 6,
  },
  coinIcon: {
    fontSize: 20,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  compactCoins: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  shopHint: {
    fontSize: 12,
    fontWeight: '600',
  },
});