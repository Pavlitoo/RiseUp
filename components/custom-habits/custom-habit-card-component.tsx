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

interface CustomHabitCardProps {
  habit: CustomHabit;
  onToggle: (habitId: string) => void;
  onEdit: (habit: CustomHabit) => void;
  onDelete: (habitId: string) => void;
}

export function CustomHabitCard({ habit, onToggle, onEdit, onDelete }: CustomHabitCardProps) {
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const handleToggle = () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggle(habit.id);
  };

  const handleEdit = () => {
    onEdit(habit);
  };

  const handleDelete = () => {
    onDelete(habit.id);
  };

  const getProgressPercentage = () => {
    return Math.min((habit.currentCount / habit.targetCount) * 100, 100);
  };

  const getPriorityColor = () => {
    switch (habit.priority) {
      case 'high': return errorColor;
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return borderColor;
    }
  };

  return (
    <ThemedView style={[
      styles.card,
      { 
        backgroundColor: cardBackground,
        borderColor: habit.completed ? primaryColor : borderColor,
        borderWidth: habit.completed ? 2 : 1,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.habitInfo}>
          <View style={styles.iconContainer}>
            <ThemedText style={[styles.icon, { color: habit.color }]}>
              {habit.icon}
            </ThemedText>
          </View>
          <View style={styles.textInfo}>
            <ThemedText type="defaultSemiBold" style={styles.name}>
              {habit.name}
            </ThemedText>
            {habit.description && (
              <ThemedText style={styles.description}>
                {habit.description}
              </ThemedText>
            )}
            <View style={styles.metadata}>
              <ThemedText style={[styles.priority, { color: getPriorityColor() }]}>
                {habit.priority === 'high' ? '🔴' : habit.priority === 'medium' ? '🟡' : '🔵'}
              </ThemedText>
              <ThemedText style={styles.frequency}>
                {habit.frequency === 'daily' ? 'Щодня' : 
                 habit.frequency === 'weekly' ? 'Щотижня' : 'Щомісяця'}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>✏️</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>🗑️</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressInfo}>
          <ThemedText style={styles.progressText}>
            {habit.currentCount} / {habit.targetCount}
          </ThemedText>
          <ThemedText style={styles.streakText}>
            🔥 {habit.streak}
          </ThemedText>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage()}%`,
                backgroundColor: habit.color,
              }
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: habit.completed ? primaryColor : 'transparent',
            borderColor: primaryColor,
          }
        ]}
        onPress={handleToggle}
      >
        <ThemedText style={[
          styles.toggleText,
          { color: habit.completed ? 'white' : primaryColor }
        ]}>
          {habit.completed ? '✓ Виконано' : 'Виконати'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

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
  // CustomHabitCard styles
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priority: {
    fontSize: 12,
  },
  frequency: {
    fontSize: 12,
    opacity: 0.6,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  progress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  toggleButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // HabitsManager styles
  container: {
    flex: 1,
    padding: 20,
  },
  managerHeader: {
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