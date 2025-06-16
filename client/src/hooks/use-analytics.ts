import { useMemo } from 'react';
import type { DayData, HydrationData } from '@shared/schema';

export interface WeeklyStats {
  weekStartDate: string;
  totalWater: number;
  averageDaily: number;
  goalMetDays: number;
  probioticDays: number;
  totalDays: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalWater: number;
  averageDaily: number;
  goalMetDays: number;
  probioticDays: number;
  totalDays: number;
  bestStreak: number;
}

export function useAnalytics(data: HydrationData) {
  // Get current day data - check if GoodBug was taken today
  const todayData: DayData = useMemo(() => {
    const goodbugTaken = data.goodbugTaken || false;
    return {
      date: data.lastDate,
      waterIntake: Number(data.waterIntake) || 0,
      medicationsTaken: goodbugTaken ? [{ medicationId: 'goodbug', timesTaken: ['today'], completed: true }] : [],
      goalMet: Number(data.waterIntake) >= Number(data.dailyGoal),
    };
  }, [data.lastDate, data.waterIntake, data.goodbugTaken, data.dailyGoal]);

  // Combine history with today's data
  const allData = useMemo(() => {
    const historyDates = new Set(data.history.map(d => d.date));
    const combined = [...data.history];
    
    // Add today's data if not already in history
    if (!historyDates.has(todayData.date)) {
      combined.push(todayData);
    } else {
      // Update today's data in history
      const todayIndex = combined.findIndex(d => d.date === todayData.date);
      if (todayIndex >= 0) {
        combined[todayIndex] = todayData;
      }
    }
    
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data.history, todayData]);

  // Weekly analytics
  const weeklyData = useMemo(() => {
    const weeks: WeeklyStats[] = [];
    const now = new Date();
    
    // Get last 4 weeks
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
        const totalWater = weekData.reduce((sum, day) => sum + day.waterIntake, 0);
        const goalMetDays = weekData.filter(day => day.goalMet).length;
        const probioticDays = weekData.filter(day => 
          day.medicationsTaken && day.medicationsTaken.some(med => med.medicationId === 'goodbug' && med.completed)
        ).length;
        
        weeks.push({
          weekStartDate: weekStart.toDateString(),
          totalWater,
          averageDaily: totalWater / weekData.length,
          goalMetDays,
          probioticDays,
          totalDays: weekData.length,
        });
      }
    }
    
    return weeks.reverse(); // Show oldest to newest
  }, [allData]);

  // Monthly analytics
  const monthlyData = useMemo(() => {
    const months: MonthlyStats[] = [];
    const now = new Date();
    
    // Get last 3 months
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthData = allData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      });
      
      if (monthData.length > 0) {
        const totalWater = monthData.reduce((sum, day) => sum + day.waterIntake, 0);
        const goalMetDays = monthData.filter(day => day.goalMet).length;
        const probioticDays = monthData.filter(day => day.probioticTaken).length;
        
        // Calculate best streak for the month
        let bestStreak = 0;
        let currentStreak = 0;
        
        const sortedMonthData = monthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortedMonthData.forEach(day => {
          if (day.goalMet) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        });
        
        months.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'long' }),
          year: monthDate.getFullYear(),
          totalWater,
          averageDaily: totalWater / monthData.length,
          goalMetDays,
          probioticDays,
          totalDays: monthData.length,
          bestStreak,
        });
      }
    }
    
    return months.reverse(); // Show oldest to newest
  }, [allData]);

  // Last 7 days for chart
  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toDateString();
      
      const dayData = allData.find(d => d.date === dateString);
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateString,
        water: dayData?.waterIntake || 0,
        goal: data.dailyGoal,
        probiotic: dayData?.probioticTaken || false,
      });
    }
    
    return days;
  }, [allData, data.dailyGoal]);

  // Overall statistics
  const overallStats = useMemo(() => {
    if (!allData || allData.length === 0) {
      return {
        totalDays: 0,
        averageDaily: 0,
        goalMetPercentage: 0,
        probioticCompliance: 0,
        totalWaterConsumed: 0,
      };
    }
    
    const totalWater = allData.reduce((sum, day) => sum + day.waterIntake, 0);
    const goalMetDays = allData.filter(day => day.goalMet).length;
    const probioticDays = allData.filter(day => day.probioticTaken).length;
    
    return {
      totalDays: allData.length,
      averageDaily: totalWater / allData.length,
      goalMetPercentage: (goalMetDays / allData.length) * 100,
      probioticCompliance: (probioticDays / allData.length) * 100,
      totalWaterConsumed: totalWater,
    };
  }, [allData]);

  return {
    weeklyData,
    monthlyData,
    last7Days,
    overallStats,
    allData,
  };
}