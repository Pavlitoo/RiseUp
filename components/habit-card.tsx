import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { Habit } from '@/types/habit';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const t = useTranslations();
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  
  const scale = useSharedValue(1);
  const checkboxScale = useSharedValue(habit.completed ? 1 : 0);
  const opacity = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor: interpolateColor(
        checkboxScale.value,
        [0, 1],
        [cardBackground, cardBackground]
      ),
    };
  });

  const animatedCheckboxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }],
      backgroundColor: interpolateColor(
        checkboxScale.value,
        [0, 1],
        ['transparent', primaryColor]
      ),
    };
  });

  const handlePress = () => {
    // Haptic feedback
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animation
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });

    // Toggle checkbox animation
    checkboxScale.value = withSpring(habit.completed ? 0 : 1, {
      damping: 15,
      stiffness: 200,
    });

    // Call the toggle function
    runOnJS(onToggle)(habit.id);
  };
  React.useEffect(() => {
    checkboxScale.value = withSpring(habit.completed ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [habit.completed]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.card,
          { 
            borderWidth: habit.completed ? 2 : 1,
            borderColor: habit.completed ? primaryColor : borderColor,
          },
          animatedCardStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Animated.Text style={[styles.icon, {
              transform: [{ scale: habit.completed ? 1.1 : 1 }]
            }]}>
              {habit.icon}
            </Animated.Text>
            <View style={styles.textContent}>
              <ThemedText type="defaultSemiBold" style={styles.habitName}>
                {habit.name}
              </ThemedText>
              <ThemedText style={styles.streak}>
                {t.streak}: {habit.streak} {t.days}
              </ThemedText>
            </View>
          </View>
          
          <Animated.View style={[
            styles.checkbox,
            { 
              borderColor: habit.completed ? primaryColor : borderColor,
            },
            animatedCheckboxStyle,
          ]}>
            {habit.completed && (
              <Animated.Text style={[styles.checkmark, { color: 'white' }]}>
                ✓
              </Animated.Text>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    marginBottom: 4,
  },
  streak: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});