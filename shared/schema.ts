import { z } from "zod";

export const HydrationDataSchema = z.object({
  waterIntake: z.number().default(0),
  dailyGoal: z.number().default(2.0),
  glassSize: z.number().default(250),
  probioticTaken: z.boolean().default(false),
  lastDate: z.string().default(() => new Date().toDateString()),
  streak: z.number().default(0),
  achievements: z.array(z.string()).default([]),
  reminderTime: z.string().default("09:00"),
  theme: z.enum(["light", "dark"]).default("light"),
});

export type HydrationData = z.infer<typeof HydrationDataSchema>;

export const SettingsSchema = z.object({
  glassSize: z.number().min(100).max(500),
  dailyGoal: z.number().min(1).max(5),
  reminderTime: z.string(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  earned: z.boolean().default(false),
});

export type Achievement = z.infer<typeof AchievementSchema>;
