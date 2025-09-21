import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { Habit } from '@/types/habit';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const t = useTranslations();
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          backgroundColor: cardBackground,
          borderWidth: habit.completed ? 2 : 1,
          borderColor: habit.completed ? primaryColor : borderColor,
        }
      ]}
      onPress={() => onToggle(habit.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <ThemedText style={styles.icon}>{habit.icon}</ThemedText>
          <View style={styles.textContent}>
            <ThemedText type="defaultSemiBold" style={styles.habitName}>
              {habit.name}
            </ThemedText>
            <ThemedText style={styles.streak}>
              {t.streak}: {habit.streak} {t.days}
            </ThemedText>
          </View>
        </View>
        
        <View style={[
          styles.checkbox,
          { 
            backgroundColor: habit.completed ? primaryColor : 'transparent',
            borderColor: habit.completed ? primaryColor : borderColor,
          }
        ]}>
          {habit.completed && (
            <ThemedText style={[styles.checkmark, { color: 'white' }]}>
              ✓
            </ThemedText>
          )}
        </View>
      </View>
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