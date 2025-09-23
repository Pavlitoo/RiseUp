import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { habitCategories } from '@/constants/habit-templates';
import { useCustomHabits } from '@/hooks/use-custom-habits';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { CustomHabit } from '@/types/custom-habit';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { HabitCreationModal } from './habit-creation-modal';
// TODO: Update the import path below to the actual location of CustomHabitCard, for example:
import { CustomHabitCard } from './custom-habit-card-component'; // Adjust the path as needed
/**
 * Виправте шлях до компонента CustomHabitCard згідно вашої структури проекту.
 * Якщо CustomHabitCard знаходиться у цьому ж файлі, визначте його тут.
 * Якщо у файлі custom-habit-card.tsx, використовуйте:
 * import { CustomHabitCard } from './custom-habit-card';
 */
export function HabitsManager() {
  const { habits, loading, toggleHabit, deleteHabit, getTotalProgress } = useCustomHabits();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [showCreationModal, setShowCreationModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<CustomHabit | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleAddHabit = () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setEditingHabit(null);
    setShowCreationModal(true);
  };

  const handleEditHabit = (habit: CustomHabit) => {
    setEditingHabit(habit);
    setShowCreationModal(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    await deleteHabit(habitId);
  };

  const handleToggleHabit = async (habitId: string) => {
    await toggleHabit(habitId);
  };

  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  const completedHabits = habits.filter(h => h.completed).length;
  const totalProgress = getTotalProgress();

  const CategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          {
            backgroundColor: selectedCategory === 'all' ? primaryColor : cardBackground,
            borderColor: selectedCategory === 'all' ? primaryColor : borderColor,
          }
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <ThemedText style={[
          styles.categoryButtonText,
          { color: selectedCategory === 'all' ? 'white' : undefined }
        ]}>
          Всі ({habits.length})
        </ThemedText>
      </TouchableOpacity>
      
      {habitCategories.map(category => {
        const categoryHabits = habits.filter(h => h.category === category.id);
        if (categoryHabits.length === 0) return null;
        
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category.id ? primaryColor : cardBackground,
                borderColor: selectedCategory === category.id ? primaryColor : borderColor,
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
            <ThemedText style={[
              styles.categoryButtonText,
              { color: selectedCategory === category.id ? 'white' : undefined }
            ]}>
              {category.name} ({categoryHabits.length})
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText style={styles.loadingText}>Завантаження...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header with stats */}
      <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          ✨ Мої звички
        </ThemedText>
        {habits.length > 0 && (
          <View style={[styles.statsContainer, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {completedHabits}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Виконано сьогодні</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {Math.round(totalProgress)}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Прогрес</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {habits.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Всього звичок</ThemedText>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Add habit button */}
      <Animated.View entering={SlideInDown.delay(200).duration(600)}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={handleAddHabit}
        >
          <ThemedText style={[styles.addButtonText, { color: 'white' }]}>
            ➕ Додати нову звичку
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {habits.length > 0 ? (
        <>
          {/* Category filter */}
          <Animated.View entering={FadeIn.delay(400).duration(600)}>
            <CategoryFilter />
          </Animated.View>

          {/* Habits list */}
          <ScrollView style={styles.habitsList} showsVerticalScrollIndicator={false}>
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit, index) => (
                <Animated.View
                  key={habit.id}
                  entering={FadeIn.delay(600 + index * 100).duration(600)}
                >
                  <CustomHabitCard
                    habit={habit}
                    onToggle={handleToggleHabit}
                    onEdit={handleEditHabit}
                    onDelete={handleDeleteHabit}
                  />
                </Animated.View>
              ))
            ) : (
              <Animated.View 
                entering={FadeIn.delay(800).duration(600)}
                style={styles.emptyCategory}
              >
                <ThemedText style={styles.emptyIcon}>📂</ThemedText>
                <ThemedText style={styles.emptyTitle}>
                  Немає звичок у цій категорії
                </ThemedText>
                <ThemedText style={styles.emptyDescription}>
                  Оберіть іншу категорію або додайте нову звичку
                </ThemedText>
              </Animated.View>
            )}
          </ScrollView>
        </>
      ) : (
        <Animated.View 
          entering={FadeIn.delay(400).duration(800)}
          style={styles.emptyState}
        >
          <ThemedText style={styles.emptyIcon}>🌱</ThemedText>
          <ThemedText style={styles.emptyTitle}>
            Почніть свій шлях до кращого життя!
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Створіть свою першу звичку та почніть формувати корисні навички щодня.
          </ThemedText>
        </Animated.View>
      )}

      <HabitCreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        editingHabit={editingHabit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  addButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryFilter: {
    marginBottom: 20,
    maxHeight: 50,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  habitsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCategory: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 100,
  },
});

// TODO: Import or define CustomHabitCard here if not already present
// Example import (adjust the path as needed):
// import { CustomHabitCard } from './custom-habit-card-component-file';

// If CustomHabitCard is defined in another file, import it above and export here:
export { };

