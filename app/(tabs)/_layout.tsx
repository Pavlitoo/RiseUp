import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslations } from '@/hooks/use-translations';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const t = useTranslations();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.habits,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-habits"
        options={{
          title: t.myHabits,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: t.statistics,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.more,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      
      {/* Приховані вкладки */}
      <Tabs.Screen
        name="progress"
        options={{
          href: null, // Приховуємо з таб бару
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          href: null, // Приховуємо з таб бару
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: null, // Приховуємо з таб бару
        }}
      />
      <Tabs.Screen
        name="backup"
        options={{
          href: null, // Приховуємо з таб бару
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Приховуємо з таб бару
        }}
      />
    </Tabs>
  );
}