import { useMemo } from 'react';

interface SimpleData {
  waterIntake: number;
  dailyGoal: number;
  glassSize: number;
  goodbugTaken: boolean;
  lastDate: string;
  streak: number;
  achievements: string[];
  theme: "light" | "dark";
  history?: Array<{
    date: string;
    waterIntake: number;
    goodbugTaken: boolean;
    goalMet: boolean;
  }>;
}

export interface DayStats {
  date: string;
  shortDate: string;
  waterIntake: number;
  goalMet: boolean;
  goodbugTaken: boolean;
}

export interface WeeklyStats {
  weekStart: string;
  totalWater: number;
  averageDaily: number;
  goalMetDays: number;
  goodbugDays: number;
  totalDays: number;
}

export interface OverallStats {
  totalDays: number;
  averageDaily: number;
  goalMetPercentage: number;
  goodbugCompliance: number;
  totalWaterConsumed: number;
  currentStreak: number;
}

export function useSimpleAnalytics(data: SimpleData) {
  // Create today's entry
  const todayEntry = useMemo(() => ({
    date: data.lastDate,
    waterIntake: Number(data.waterIntake) || 0,
    goodbugTaken: Boolean(data.goodbugTaken),
    goalMet: Number(data.waterIntake) >= Number(data.dailyGoal),
  }), [data.lastDate, data.waterIntake, data.goodbugTaken, data.dailyGoal]);

  // Combine history with today
  const allData = useMemo(() => {
    const history = data.history || [];
    const historyDates = new Set(history.map(d => d.date));
    const combined = [...history];
    
    // Add or update today's data
    if (!historyDates.has(todayEntry.date)) {
      combined.push(todayEntry);
    } else {
      const todayIndex = combined.findIndex(d => d.date === todayEntry.date);
      if (todayIndex >= 0) {
        combined[todayIndex] = todayEntry;
      }
    }
    
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.history, todayEntry]);

  // Last 7 days for chart
  const last7Days = useMemo(() => {
    const days: DayStats[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toDateString();
      
      const dayData = allData.find(d => d.date === dateString);
      days.push({
        date: dateString,
        shortDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
        waterIntake: dayData?.waterIntake || 0,
        goalMet: dayData?.goalMet || false,
        goodbugTaken: dayData?.goodbugTaken || false,
      });
    }
    
    return days;
  }, [allData]);

  // Weekly data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks: WeeklyStats[] = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekData = allData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= weekStart && dayDate <= weekEnd;
      });
      
      if (weekData.length > 0) {
        const totalWater = weekData.reduce((sum, day) => sum + Number(day.waterIntake), 0);
        const goalMetDays = weekData.filter(day => day.goalMet).length;
        const goodbugDays = weekData.filter(day => day.goodbugTaken).length;
        
        weeks.push({
          weekStart: weekStart.toDateString(),
          totalWater: Math.round(totalWater * 100) / 100, // Round to 2 decimal places
          averageDaily: Math.round((totalWater / weekData.length) * 100) / 100,
          goalMetDays,
          goodbugDays,
          totalDays: weekData.length,
        });
      }
    }
    
    return weeks.reverse(); // Show oldest to newest
  }, [allData]);

  // Overall statistics with precise calculations
  const overallStats = useMemo((): OverallStats => {
    if (!allData || allData.length === 0) {
      return {
        totalDays: 0,
        averageDaily: 0,
        goalMetPercentage: 0,
        goodbugCompliance: 0,
        totalWaterConsumed: 0,
        currentStreak: data.streak || 0,
      };
    }
    
    const totalWater = allData.reduce((sum, day) => sum + Number(day.waterIntake), 0);
    const goalMetDays = allData.filter(day => day.goalMet).length;
    const goodbugDays = allData.filter(day => day.goodbugTaken).length;
    
    return {
      totalDays: allData.length,
      averageDaily: Math.round((totalWater / allData.length) * 100) / 100,
      goalMetPercentage: Math.round((goalMetDays / allData.length) * 100),
      goodbugCompliance: Math.round((goodbugDays / allData.length) * 100),
      totalWaterConsumed: Math.round(totalWater * 100) / 100,
      currentStreak: data.streak || 0,
    };
  }, [allData, data.streak]);

  return {
    last7Days,
    weeklyData,
    overallStats,
    allData,
  };
}