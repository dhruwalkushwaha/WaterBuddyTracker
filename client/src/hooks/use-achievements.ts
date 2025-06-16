import { useMemo } from 'react';

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export function useAchievements(earnedAchievements: string[]) {
  const allAchievements: Achievement[] = useMemo(() => [
    { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Log water intake before 9 AM' },
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Log water intake after 10 PM' },
    { id: 'milestone_25', name: 'Quarter Way', icon: '💧', description: 'Reach 25% of daily goal' },
    { id: 'milestone_50', name: 'Half Full', icon: '🌊', description: 'Reach 50% of daily goal' },
    { id: 'milestone_75', name: 'Almost There', icon: '💪', description: 'Reach 75% of daily goal' },
    { id: 'milestone_100', name: 'Goal Crusher', icon: '🎉', description: 'Complete daily hydration goal' },
    { id: 'streak_3', name: '3 Day Streak', icon: '🔥', description: 'Maintain hydration for 3 consecutive days' },
    { id: 'streak_7', name: 'Week Warrior', icon: '🔥', description: 'Maintain hydration for 7 consecutive days' },
    { id: 'streak_14', name: 'Two Week Hero', icon: '🔥', description: 'Maintain hydration for 14 consecutive days' },
    { id: 'streak_30', name: 'Monthly Master', icon: '🔥', description: 'Maintain hydration for 30 consecutive days' },
  ], []);

  const unlockedAchievements = useMemo(() => 
    allAchievements.filter(achievement => earnedAchievements.includes(achievement.id)),
    [allAchievements, earnedAchievements]
  );

  const getAchievementById = (id: string) => 
    allAchievements.find(achievement => achievement.id === id);

  return {
    allAchievements,
    unlockedAchievements,
    getAchievementById,
  };
}
