import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import type { HydrationData } from '@shared/schema';

const initialData: HydrationData = {
  waterIntake: 0,
  dailyGoal: 2.0,
  glassSize: 250,
  probioticTaken: false,
  lastDate: new Date().toDateString(),
  streak: 0,
  achievements: [],
  reminderTime: "09:00",
  theme: "light",
  history: [],
};

export function useHydration() {
  const [data, setData] = useLocalStorage<HydrationData>('hydration-data', initialData);
  const [showToast, setShowToast] = useState<{ message: string; type: string } | null>(null);

  // Check if it's a new day and reset daily data
  const checkNewDay = useCallback(() => {
    const today = new Date().toDateString();
    if (data.lastDate !== today) {
      setData(prev => {
        let newStreak = prev.streak;
        const newAchievements = [...prev.achievements];
        const newHistory = [...prev.history];
        
        // Save yesterday's data to history if we have any progress
        if (prev.waterIntake > 0 || prev.probioticTaken) {
          const yesterdayData = {
            date: prev.lastDate,
            waterIntake: prev.waterIntake,
            probioticTaken: prev.probioticTaken,
            goalMet: prev.waterIntake >= prev.dailyGoal,
          };
          
          // Remove existing entry for same date if it exists
          const existingIndex = newHistory.findIndex(day => day.date === prev.lastDate);
          if (existingIndex >= 0) {
            newHistory[existingIndex] = yesterdayData;
          } else {
            newHistory.push(yesterdayData);
          }
          
          // Keep only last 90 days of history for performance
          newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          if (newHistory.length > 90) {
            newHistory.splice(90);
          }
        }
        
        // Check if yesterday's goal was met for streak
        if (prev.waterIntake >= prev.dailyGoal) {
          newStreak += 1;
          
          // Check for streak achievements
          const streakMilestones = [3, 7, 14, 30];
          streakMilestones.forEach(milestone => {
            if (newStreak === milestone && !prev.achievements.includes(`streak_${milestone}`)) {
              newAchievements.push(`streak_${milestone}`);
              setShowToast({ message: `Achievement unlocked: ${milestone} Day Streak! 🔥`, type: 'achievement' });
            }
          });
        } else if (newStreak > 0) {
          newStreak = 0;
        }
        
        return {
          ...prev,
          waterIntake: 0,
          probioticTaken: false,
          lastDate: today,
          streak: newStreak,
          achievements: newAchievements,
          history: newHistory,
        };
      });
    }
  }, [data.lastDate, data.waterIntake, data.dailyGoal, data.streak, data.achievements, data.history, setData]);

  // Add water intake
  const addWater = useCallback(() => {
    const glassAmount = data.glassSize / 1000; // Convert to liters
    const newIntake = Math.min(data.waterIntake + glassAmount, data.dailyGoal + 1);
    
    setData(prev => {
      const newAchievements = [...prev.achievements];
      const percentage = (newIntake / prev.dailyGoal) * 100;
      const milestones = [25, 50, 75, 100];
      
      // Check milestones
      milestones.forEach(milestone => {
        if (percentage >= milestone && !prev.achievements.includes(`milestone_${milestone}`)) {
          newAchievements.push(`milestone_${milestone}`);
          const messages = {
            25: "Great start! Keep it flowing! 💧",
            50: "Halfway there! You're doing amazing! 🌊",
            75: "Almost there! The finish line is in sight! 🏁",
            100: "Congratulations! Goal achieved! 🎉"
          };
          setShowToast({ message: messages[milestone as keyof typeof messages], type: 'success' });
        }
      });
      
      // Check time-based achievements
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 9 && !prev.achievements.includes('early_bird')) {
        newAchievements.push('early_bird');
        setShowToast({ message: "Achievement unlocked: Early Bird! 🌅", type: 'achievement' });
      }
      
      if (hour >= 22 && !prev.achievements.includes('night_owl')) {
        newAchievements.push('night_owl');
        setShowToast({ message: "Achievement unlocked: Night Owl! 🦉", type: 'achievement' });
      }
      
      return {
        ...prev,
        waterIntake: newIntake,
        achievements: newAchievements,
      };
    });
  }, [data.glassSize, data.waterIntake, data.dailyGoal, setData]);

  // Toggle probiotic
  const toggleProbiotic = useCallback(() => {
    setData(prev => {
      const newTaken = !prev.probioticTaken;
      if (newTaken) {
        setShowToast({ message: "Good job taking your GoodBug! 🦠✨", type: 'success' });
      }
      return { ...prev, probioticTaken: newTaken };
    });
  }, [setData]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<HydrationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, [setData]);

  // Check for probiotic reminder
  useEffect(() => {
    if (!data.probioticTaken) {
      const now = new Date();
      const [hours, minutes] = data.reminderTime.split(':');
      const reminderTime = new Date();
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (now >= reminderTime) {
        setTimeout(() => {
          setShowToast({ message: "Time for your GoodBug probiotic! 💊", type: 'reminder' });
        }, 2000);
      }
    }
  }, [data.probioticTaken, data.reminderTime]);

  // Check for new day on component mount
  useEffect(() => {
    checkNewDay();
  }, [checkNewDay]);

  return {
    data,
    addWater,
    toggleProbiotic,
    updateSettings,
    showToast,
    setShowToast,
    checkNewDay,
  };
}
