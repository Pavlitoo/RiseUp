import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLanguageKey, useTranslations } from '@/hooks/use-translations';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function MoreTab() {
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const languageKey = useLanguageKey();

  const menuItems = [
    {
      title: t.progress,
      description: 'Переглянути детальний прогрес',
      icon: '📊',
      route: '/progress',
      color: primaryColor,
    },
    {
      title: 'Досягнення',
      description: 'Ваші розблоковані нагороди',
      icon: '🏆',
      route: '/achievements',
      color: '#f59e0b',
    },
    {
      title: 'Інсайти',
      description: 'Персональні рекомендації',
      icon: '🧠',
      route: '/insights',
      color: '#8b5cf6',
    },
    {
      title: 'Резервні копії',
      description: 'Збереження та відновлення даних',
      icon: '💾',
      route: '/backup',
      color: '#10b981',
    },
    {
      title: 'Про додаток',
      description: 'Інформація та підтримка',
      icon: 'ℹ️',
      route: '/about',
      color: '#6b7280',
    },
  ];

  return (
    <ScrollView key={languageKey} style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            ⚙️ {t.more}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Додаткові функції та налаштування
          </ThemedText>
        </Animated.View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.route}
              entering={FadeIn.delay(200 + index * 100).duration(600)}
            >
              <Link href={item.route as any} asChild>
                <TouchableOpacity>
                  <ThemedView style={[
                    styles.menuItem,
                    { backgroundColor: cardBackground, borderColor }
                  ]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                      <ThemedText style={[styles.icon, { color: item.color }]}>
                        {item.icon}
                      </ThemedText>
                    </View>
                    <View style={styles.textContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={styles.itemDescription}>
                        {item.description}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.arrow, { color: item.color }]}>
                      →
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});