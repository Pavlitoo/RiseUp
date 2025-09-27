import { ThemedText } from '@/components/themed-text';
import { InputField } from '@/components/ui/input-field';
import { habitCategories, habitColors, habitIcons, habitTemplates } from '@/constants/habit-templates';
import { useCustomHabits } from '@/hooks/use-custom-habits';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { CustomHabit, HabitTemplate } from '@/types/custom-habit';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface HabitCreationModalProps {
  visible: boolean;
  onClose: () => void;
  editingHabit?: CustomHabit | null;
}

export function HabitCreationModal({ visible, onClose, editingHabit }: HabitCreationModalProps) {
  const { createHabit, updateHabit } = useCustomHabits();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: editingHabit?.name || '',
    description: editingHabit?.description || '',
    icon: editingHabit?.icon || '⭐',
    color: editingHabit?.color || primaryColor,
    frequency: editingHabit?.frequency || 'daily' as 'daily' | 'weekly' | 'monthly',
    targetCount: editingHabit?.targetCount || 1,
    category: editingHabit?.category || 'other',
    priority: editingHabit?.priority || 'medium' as 'low' | 'medium' | 'high',
    reminderTime: editingHabit?.reminderTime || '',
    deadline: editingHabit?.deadline || undefined,
  });

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      
      // Reset form when opening for new habit
      if (!editingHabit) {
        setStep(1);
        setSelectedTemplate(null);
        setFormData({
          name: '',
          description: '',
          icon: '⭐',
          color: primaryColor,
          frequency: 'daily',
          targetCount: 1,
          category: 'other',
          priority: 'medium',
          reminderTime: '',
          deadline: '',
        });
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, editingHabit]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleTemplateSelect = (template: HabitTemplate) => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      category: template.category,
      frequency: template.suggestedFrequency,
      targetCount: template.suggestedTarget,
    });
    setStep(2);
  };

  const handleCustomHabit = () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Помилка', 'Введіть назву звички');
      return;
    }

    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData);
      } else {
        await createHabit(formData);
      }
      onClose();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти звичку');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[
        styles.stepDot,
        { backgroundColor: step >= 1 ? primaryColor : borderColor }
      ]}>
        <ThemedText style={[styles.stepText, { color: step >= 1 ? 'white' : borderColor }]}>
          1
        </ThemedText>
      </View>
      <View style={[styles.stepLine, { backgroundColor: step >= 2 ? primaryColor : borderColor }]} />
      <View style={[
        styles.stepDot,
        { backgroundColor: step >= 2 ? primaryColor : borderColor }
      ]}>
        <ThemedText style={[styles.stepText, { color: step >= 2 ? 'white' : borderColor }]}>
          2
        </ThemedText>
      </View>
    </View>
  );

  const renderTemplateSelection = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Оберіть шаблон або створіть власну звичку
      </ThemedText>
      
      <TouchableOpacity
        style={[styles.customHabitButton, { backgroundColor: primaryColor }]}
        onPress={handleCustomHabit}
      >
        <ThemedText style={styles.customHabitIcon}>✨</ThemedText>
        <ThemedText style={[styles.customHabitText, { color: 'white' }]}>
          Створити власну звичку
        </ThemedText>
      </TouchableOpacity>

      {habitCategories.map(category => {
        const categoryTemplates = habitTemplates.filter(t => t.category === category.id);
        if (categoryTemplates.length === 0) return null;

        return (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.categoryName}>
                {category.name}
              </ThemedText>
            </View>
            
            <View style={styles.templatesGrid}>
              {categoryTemplates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    { backgroundColor: cardBackground, borderColor }
                  ]}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <ThemedText style={[styles.templateIcon, { color: template.color }]}>
                    {template.icon}
                  </ThemedText>
                  <ThemedText style={styles.templateName}>
                    {template.name}
                  </ThemedText>
                  <ThemedText style={styles.templateDescription}>
                    {template.description}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderHabitForm = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText type="subtitle" style={styles.stepTitle}>
        Налаштування звички
      </ThemedText>

      <InputField
        label="Назва звички"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
        placeholder="Наприклад: Пити воду"
        required
      />

      <InputField
        label="Опис (необов'язково)"
        value={formData.description}
        onChangeText={(value) => setFormData({ ...formData, description: value })}
        placeholder="Короткий опис звички"
        multiline
      />

      {/* Icon Selection */}
      <View style={styles.formSection}>
        <ThemedText style={styles.sectionLabel}>Іконка</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
          {habitIcons.map(icon => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                {
                  backgroundColor: formData.icon === icon ? primaryColor : cardBackground,
                  borderColor: formData.icon === icon ? primaryColor : borderColor,
                }
              ]}
              onPress={() => setFormData({ ...formData, icon })}
            >
              <ThemedText style={styles.iconButtonText}>{icon}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Color Selection */}
      <View style={styles.formSection}>
        <ThemedText style={styles.sectionLabel}>Колір</ThemedText>
        <View style={styles.colorGrid}>
          {habitColors.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                formData.color === color && styles.selectedColor
              ]}
              onPress={() => setFormData({ ...formData, color })}
            />
          ))}
        </View>
      </View>

      {/* Frequency Selection */}
      <View style={styles.formSection}>
        <ThemedText style={styles.sectionLabel}>Частота</ThemedText>
        <View style={styles.frequencyButtons}>
          {[
            { key: 'daily', label: 'Щодня', icon: '📅' },
            { key: 'weekly', label: 'Щотижня', icon: '📆' },
            { key: 'monthly', label: 'Щомісяця', icon: '🗓️' },
          ].map(freq => (
            <TouchableOpacity
              key={freq.key}
              style={[
                styles.frequencyButton,
                {
                  backgroundColor: formData.frequency === freq.key ? primaryColor : cardBackground,
                  borderColor: formData.frequency === freq.key ? primaryColor : borderColor,
                }
              ]}
              onPress={() => setFormData({ ...formData, frequency: freq.key as any })}
            >
              <ThemedText style={styles.frequencyIcon}>{freq.icon}</ThemedText>
              <ThemedText style={[
                styles.frequencyLabel,
                { color: formData.frequency === freq.key ? 'white' : undefined }
              ]}>
                {freq.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Target Count */}
      <View style={styles.formSection}>
        <ThemedText style={styles.sectionLabel}>
          Ціль ({formData.frequency === 'daily' ? 'на день' : formData.frequency === 'weekly' ? 'на тиждень' : 'на місяць'})
        </ThemedText>
        <View style={styles.targetContainer}>
          <TouchableOpacity
            style={[styles.targetButton, { borderColor }]}
            onPress={() => setFormData({ ...formData, targetCount: Math.max(1, formData.targetCount - 1) })}
          >
            <ThemedText style={styles.targetButtonText}>−</ThemedText>
          </TouchableOpacity>
          <View style={[styles.targetDisplay, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.targetText}>{formData.targetCount}</ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.targetButton, { borderColor }]}
            onPress={() => setFormData({ ...formData, targetCount: formData.targetCount + 1 })}
          >
            <ThemedText style={styles.targetButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Priority Selection */}
      <View style={styles.formSection}>
        <ThemedText style={styles.sectionLabel}>Пріоритет</ThemedText>
        <View style={styles.priorityButtons}>
          {[
            { key: 'low', label: 'Низький', color: '#6b7280', icon: '🔵' },
            { key: 'medium', label: 'Середній', color: '#f59e0b', icon: '🟡' },
            { key: 'high', label: 'Високий', color: '#ef4444', icon: '🔴' },
          ].map(priority => (
            <TouchableOpacity
              key={priority.key}
              style={[
                styles.priorityButton,
                {
                  backgroundColor: formData.priority === priority.key ? priority.color : cardBackground,
                  borderColor: formData.priority === priority.key ? priority.color : borderColor,
                }
              ]}
              onPress={() => setFormData({ ...formData, priority: priority.key as any })}
            >
              <ThemedText style={styles.priorityIcon}>{priority.icon}</ThemedText>
              <ThemedText style={[
                styles.priorityLabel,
                { color: formData.priority === priority.key ? 'white' : undefined }
              ]}>
                {priority.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, animatedModalStyle]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View style={[
          styles.modal,
          { backgroundColor: cardBackground, borderColor },
          animatedContentStyle,
        ]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {editingHabit ? 'Редагувати звичку' : 'Нова звичка'}
            </ThemedText>
            {!editingHabit && renderStepIndicator()}
          </View>

          {editingHabit || step === 2 ? renderHabitForm() : renderTemplateSelection()}

          <View style={styles.footer}>
            {step === 2 && !editingHabit && (
              <TouchableOpacity
                style={[styles.backButton, { borderColor }]}
                onPress={() => setStep(1)}
              >
                <ThemedText style={styles.backButtonText}>← Назад</ThemedText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: primaryColor }]}
              onPress={editingHabit || step === 2 ? handleSave : undefined}
              disabled={!editingHabit && step !== 2}
            >
              <ThemedText style={[styles.saveButtonText, { color: 'white' }]}>
                {editingHabit ? 'Зберегти' : 'Створити звичку'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepContent: {
    maxHeight: 500,
    padding: 20,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  customHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  customHabitIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  customHabitText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconScroll: {
    maxHeight: 60,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButtonText: {
    fontSize: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  frequencyIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  frequencyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  targetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  targetDisplay: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});