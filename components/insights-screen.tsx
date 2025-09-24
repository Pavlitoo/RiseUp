import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { firebaseService } from '@/services/FirebaseService';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface UserInsights {
  totalDays: number;
  avgCompletion: number;
  bestStreak: number;
  mostActiveDay: string;
  improvementTrend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export function InsightsScreen() {
  const { authState } = useAuth();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    if (!authState.user) return;

    try {
      const userInsights = await firebaseService.getUserInsights(authState.user.id);
      setInsights(userInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  useEffect(() => {
    loadInsights();
  }, [authState.user]);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return primaryColor;
      case 'declining': return errorColor;
      default: return warningColor;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return 'Покращується';
      case 'declining': return 'Погіршується';
      default: return 'Стабільно';
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Аналізуємо ваш прогрес...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!insights) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyIcon}>📊</ThemedText>
          <ThemedText style={styles.emptyTitle}>Недостатньо даних</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Продовжуйте виконувати звички, щоб отримати персоналізовані інсайти
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🧠 Персональні інсайти
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Аналіз вашого прогресу та рекомендації
          </ThemedText>
        </View>

        {/* Overview Stats */}
        <Animated.View 
          entering={FadeIn.duration(800)}
          style={[styles.statsContainer, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📈 Загальна статистика
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {insights.totalDays}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Днів активності</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {insights.avgCompletion}%
              </ThemedText>
              <ThemedText style={styles.statLabel}>Середнє виконання</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {insights.bestStreak}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Найкраща серія</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {insights.mostActiveDay}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Найактивніший день</ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Trend Analysis */}
        <Animated.View 
          entering={FadeIn.delay(200).duration(800)}
          style={[styles.trendContainer, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 Аналіз тренду
          </ThemedText>
          
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <ThemedText style={styles.trendIcon}>
                {getTrendIcon(insights.improvementTrend)}
              </ThemedText>
              <ThemedText style={[styles.trendText, { color: getTrendColor(insights.improvementTrend) }]}>
                {getTrendText(insights.improvementTrend)}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.trendDescription}>
              {insights.improvementTrend === 'improving' && 
                'Ваші результати покращуються! Продовжуйте в тому ж дусі.'}
              {insights.improvementTrend === 'declining' && 
                'Помітно зниження активності. Час повернутися до звичок!'}
              {insights.improvementTrend === 'stable' && 
                'Ваші результати стабільні. Можливо, час додати нові виклики?'}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Recommendations */}
        <Animated.View 
          entering={FadeIn.delay(400).duration(800)}
          style={[styles.recommendationsContainer, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💡 Персональні рекомендації
          </ThemedText>
          
          {insights.recommendations.map((recommendation, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(600 + index * 100).duration(600)}
              style={styles.recommendationCard}
            >
              <ThemedText style={styles.recommendationIcon}>✨</ThemedText>
              <ThemedText style={styles.recommendationText}>
                {recommendation}
              </ThemedText>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Performance Insights */}
        <Animated.View 
          entering={FadeIn.delay(600).duration(800)}
          style={[styles.performanceContainer, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 Аналіз продуктивності
          </ThemedText>
          
          <View style={styles.performanceCard}>
            <ThemedText style={styles.performanceTitle}>
              Найкращий час для звичок
            </ThemedText>
            <ThemedText style={styles.performanceValue}>
              {insights.mostActiveDay}
            </ThemedText>
            <ThemedText style={styles.performanceDescription}>
              У цей день ви найчастіше виконуєте звички
            </ThemedText>
          </View>
          
          <View style={styles.performanceCard}>
            <ThemedText style={styles.performanceTitle}>
              Рівень постійності
            </ThemedText>
            <ThemedText style={[
              styles.performanceValue,
              { color: insights.avgCompletion > 70 ? primaryColor : warningColor }
            ]}>
              {insights.avgCompletion > 70 ? 'Високий' : insights.avgCompletion > 40 ? 'Середній' : 'Низький'}
            </ThemedText>
            <ThemedText style={styles.performanceDescription}>
              Базується на середньому відсотку виконання
            </ThemedText>
          </View>
        </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsContainer: {
    borderRadius: 16,
    padding: 20,
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
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  trendContainer: {
    borderRadius: 16,
    padding: 20,
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
  trendCard: {
    alignItems: 'center',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  trendText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendationsContainer: {
    borderRadius: 16,
    padding: 20,
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
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  performanceContainer: {
    borderRadius: 16,
    padding: 20,
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
  performanceCard: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  performanceDescription: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});