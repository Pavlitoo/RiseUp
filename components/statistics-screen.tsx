import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useBonuses } from '@/hooks/use-bonuses';
import { useHabits } from '@/hooks/use-habits';
import { useStatistics } from '@/hooks/use-statistics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;
const chartHeight = 200;

export function StatisticsScreen() {
  const { habits, character } = useHabits();
  const { statistics, getDailyDataForChart } = useStatistics();
  const { getUnclaimedCount } = useBonuses();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  // Get real statistics
  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const unclaimedBonuses = getUnclaimedCount();

  // Get real weekly data for chart
  const weeklyData = getDailyDataForChart(7);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}
    >
      {typeof icon === 'string' ? (
        <ThemedText style={[styles.statIcon, { color }]}>{icon}</ThemedText>
      ) : (
        <Image source={icon} style={[styles.statIconImage, { tintColor: color }]} />
      )}
      <ThemedText type="defaultSemiBold" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
      {subtitle && (
        <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
      )}
    </Animated.View>
  );

  const WeeklyChart = () => {
    const maxValue = Math.max(...weeklyData.map(d => d.total));
    const barWidth = (chartWidth - 80) / 7;
    
    return (
      <Animated.View
        entering={FadeIn.delay(400).duration(800)}
        style={[styles.chartContainer, { backgroundColor: cardBackground, borderColor }]}
      >
        <ThemedText type="subtitle" style={styles.chartTitle}>
          📊 Тижневий прогрес
        </ThemedText>
        
        <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <Line
              key={i}
              x1="40"
              y1={40 + (i * 30)}
              x2={chartWidth - 20}
              y2={40 + (i * 30)}
              stroke={borderColor}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Bars */}
          {weeklyData.map((data, index) => {
            const barHeight = (data.completed / maxValue) * 120;
            const x = 50 + index * barWidth;
            
            return (
              <React.Fragment key={index}>
                {/* Background bar */}
                <Rect
                  x={x}
                  y={40}
                  width={barWidth - 10}
                  height={120}
                  fill={borderColor}
                  opacity="0.2"
                  rx="4"
                />
                {/* Progress bar */}
                <Rect
                  x={x}
                  y={160 - barHeight}
                  width={barWidth - 10}
                  height={barHeight}
                  fill={primaryColor}
                  rx="4"
                />
                {/* Day label */}
                <SvgText
                  x={x + (barWidth - 10) / 2}
                  y={180}
                  fontSize="12"
                  fill={borderColor}
                  textAnchor="middle"
                >
                  {data.day}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📈 Статистика
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Твій детальний прогрес
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Сьогодні"
            value={`${completedToday}/${totalHabits}`}
            icon={require('@/assets/images/complete.png')}
            color={primaryColor}
            subtitle={`${Math.round(completionRate)}%`}
          />
          
          <StatCard
            title="Рівень"
            value={character.level}
            icon={require('@/assets/images/target.png')}
            color={secondaryColor}
          />
          
          <StatCard
            title="Найдовша серія"
            value={statistics.bestStreak}
            icon={require('@/assets/images/fire.png')}
            color="#f59e0b"
            subtitle="днів"
          />
          
          <StatCard
            title="Всього днів"
            value={statistics.totalDays}
            icon={require('@/assets/images/statistics.png')}
            color="#8b5cf6"
            subtitle="днів"
          />
          
          <StatCard
            title="Досвід"
            value={statistics.totalExperience}
            icon="⭐"
            color="#f59e0b"
            subtitle="XP"
          />
          
          <StatCard
            title="Бонуси"
            value={unclaimedBonuses}
            icon="🎁"
            color="#ef4444"
            subtitle="доступно"
          />
        </View>

        <WeeklyChart />

        <Animated.View
          entering={FadeIn.delay(600).duration(800)}
          style={[styles.habitsBreakdown, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.breakdownTitle}>
            <Image source={require('@/assets/images/target.png')} style={styles.titleIcon} /> Розбивка по звичках
          </ThemedText>
          
          {habits.map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeIn.delay(800 + index * 100).duration(600)}
              style={styles.habitRow}
            >
              <View style={styles.habitInfo}>
                <ThemedText style={styles.habitIcon}>
                  {habit.id === '1' ? '💧' : habit.id === '2' ? '💪' : habit.id === '3' ? '🧘' : '📚'}
                </ThemedText>
                <View style={styles.habitDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.habitName}>
                    {habit.name}
                  </ThemedText>
                  <ThemedText style={styles.habitStreak}>
                    Серія: {habit.streak} днів
                  </ThemedText>
                </View>
              </View>
              <View style={styles.habitStatus}>
                <ThemedText style={[
                  styles.statusIcon,
                  { color: habit.completed ? primaryColor : borderColor }
                ]}>
                  {habit.completed ? '✅' : '⭕'}
                </ThemedText>
              </View>
            </Animated.View>
          ))}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statIconImage: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  chartContainer: {
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
  chartTitle: {
    textAlign: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  chart: {
    alignSelf: 'center',
  },
  habitsBreakdown: {
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
  breakdownTitle: {
    textAlign: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    marginBottom: 2,
  },
  habitStreak: {
    fontSize: 12,
    opacity: 0.7,
  },
  habitStatus: {
    marginLeft: 12,
  },
  statusIcon: {
    fontSize: 20,
  },
});