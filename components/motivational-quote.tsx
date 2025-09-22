import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { motivationalQuotes } from '@/constants/motivational-quotes';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export function MotivationalQuote() {
  const { authState } = useAuth();
  const [currentQuote, setCurrentQuote] = useState('');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const quotes = motivationalQuotes[authState.settings.language];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);

    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [authState.settings.language]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const handleRefresh = () => {
    const quotes = motivationalQuotes[authState.settings.language];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    opacity.value = withTiming(0, { duration: 200 }, () => {
      setCurrentQuote(randomQuote);
      opacity.value = withTiming(1, { duration: 400 });
    });
  };

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: cardBackground, borderColor },
      animatedStyle,
    ]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.quoteIcon}>💭</ThemedText>
        <ThemedText style={styles.quote}>
          {currentQuote}
        </ThemedText>
        <TouchableOpacity
          style={[styles.refreshButton, { borderColor: primaryColor }]}
          onPress={handleRefresh}
        >
          <ThemedText style={[styles.refreshText, { color: primaryColor }]}>
            🔄 Нова цитата
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    padding: 20,
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  quote: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  refreshButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
  },
});