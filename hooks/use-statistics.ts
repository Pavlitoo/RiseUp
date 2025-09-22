import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect } from 'react';
import { createGlobalState } from './use-global-state';

const STATISTICS_KEY = '@riseup_statistics';
const DAILY_HISTORY_KEY = '@riseup_daily_history';

export interface DailyRecord {
  date: string; // YYYY-MM-DD format
  completedHabits: string[]; // habit IDs
  totalHabits: number;
  experienceGained: number;
  perfectDay: boolean;
}

export interface WeeklyStats {
  week: string; // YYYY-WW format
  totalCompletions: number;
  perfectDays: number;
  averageCompletion: number;
  bestStreak: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalCompletions: number;
  perfectDays: number;
  averageCompletion: number;
  bestStreak: number;
  totalExperience: number;
}

export interface OverallStats {
  totalDays: number;
  totalCompletions: number;
  perfectDays: number;
  currentStreak: number;
  bestStreak: number;
  totalExperience: number;
  averageCompletion: number;
  firstHabitDate: string;
}

interface StatisticsState {
  dailyHistory: DailyRecord[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  overallStats: OverallStats;
}

const defaultStats: OverallStats = {
  totalDays: 0,
  totalCompletions: 0,
  perfectDays: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalExperience: 0,
  averageCompletion: 0,
  firstHabitDate: new Date().toISOString().split('T')[0],
};

const defaultState: StatisticsState = {
  dailyHistory: [],
  weeklyStats: [],
  monthlyStats: [],
  overallStats: defaultStats,
};

const useGlobalStatisticsState = createGlobalState(defaultState);

export function useStatistics() {
  const [state, setState] = useGlobalStatisticsState();

  useEffect(() => {
    let isMounted = true;
    
    const loadStatistics = async () => {
      try {
        const [statisticsData, historyData] = await Promise.all([
          AsyncStorage.getItem(STATISTICS_KEY),
          AsyncStorage.getItem(DAILY_HISTORY_KEY),
        ]);

        const overallStats = statisticsData ? JSON.parse(statisticsData) : defaultStats;
        const dailyHistory = historyData ? JSON.parse(historyData) : [];

        if (isMounted) {
          setState(prev => ({
            ...prev,
            overallStats,
            dailyHistory,
          }));
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };

    loadStatistics();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveStatistics = useCallback(async (stats: OverallStats, history: DailyRecord[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STATISTICS_KEY, JSON.stringify(stats)),
        AsyncStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(history)),
      ]);
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  }, []);

  const updateDailyRecord = useCallback((completedHabitIds: string[], totalHabits: number) => {
    const today = new Date().toISOString().split('T')[0];
    const experienceGained = completedHabitIds.length * 20;
    const perfectDay = completedHabitIds.length === totalHabits && totalHabits > 0;

    setState(prev => {
      const newHistory = [...prev.dailyHistory];
      const existingIndex = newHistory.findIndex(record => record.date === today);
      
      const newRecord: DailyRecord = {
        date: today,
        completedHabits: completedHabitIds,
        totalHabits,
        experienceGained,
        perfectDay,
      };

      if (existingIndex >= 0) {
        newHistory[existingIndex] = newRecord;
      } else {
        newHistory.push(newRecord);
      }

      // Keep only last 365 days
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      const filteredHistory = newHistory.filter(record => 
        new Date(record.date) >= oneYearAgo
      );

      // Calculate overall stats
      const totalDays = filteredHistory.length;
      const totalCompletions = filteredHistory.reduce((sum, record) => sum + record.completedHabits.length, 0);
      const perfectDays = filteredHistory.filter(record => record.perfectDay).length;
      const totalExperience = filteredHistory.reduce((sum, record) => sum + record.experienceGained, 0);
      const averageCompletion = totalDays > 0 ? totalCompletions / totalDays : 0;

      // Calculate current streak
      let currentStreak = 0;
      const sortedHistory = [...filteredHistory].sort((a, b) => b.date.localeCompare(a.date));
      
      for (const record of sortedHistory) {
        if (record.completedHabits.length > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate best streak
      let bestStreak = 0;
      let tempStreak = 0;
      
      for (const record of sortedHistory.reverse()) {
        if (record.completedHabits.length > 0) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      const newOverallStats: OverallStats = {
        totalDays,
        totalCompletions,
        perfectDays,
        currentStreak,
        bestStreak,
        totalExperience,
        averageCompletion,
        firstHabitDate: filteredHistory.length > 0 ? 
          filteredHistory.sort((a, b) => a.date.localeCompare(b.date))[0].date : 
          today,
      };

      saveStatistics(newOverallStats, filteredHistory);

      return {
        ...prev,
        dailyHistory: filteredHistory,
        overallStats: newOverallStats,
      };
    });
  }, [setState, saveStatistics]);

  const getWeeklyData = useCallback((weeksBack: number = 4) => {
    const weeklyData = [];
    const today = new Date();
    
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekRecords = state.dailyHistory.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd;
      });

      const totalCompletions = weekRecords.reduce((sum, record) => sum + record.completedHabits.length, 0);
      const perfectDays = weekRecords.filter(record => record.perfectDay).length;
      const averageCompletion = weekRecords.length > 0 ? totalCompletions / weekRecords.length : 0;

      weeklyData.push({
        week: `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7)}`,
        totalCompletions,
        perfectDays,
        averageCompletion,
        bestStreak: 0, // Calculate if needed
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
      });
    }

    return weeklyData;
  }, [state.dailyHistory]);

  const getDailyDataForChart = useCallback((daysBack: number = 7) => {
    const chartData = [];
    const today = new Date();
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const record = state.dailyHistory.find(r => r.date === dateString);
      const dayName = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
      
      chartData.push({
        day: dayName,
        date: dateString,
        completed: record ? record.completedHabits.length : 0,
        total: record ? record.totalHabits : 0,
        perfectDay: record ? record.perfectDay : false,
      });
    }

    return chartData;
  }, [state.dailyHistory]);

  return {
    statistics: state.overallStats,
    dailyHistory: state.dailyHistory,
    updateDailyRecord,
    getWeeklyData,
    getDailyDataForChart,
  };
}