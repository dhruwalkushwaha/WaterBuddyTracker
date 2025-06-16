import { z } from "zod";

export const MedicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.enum(["once", "twice", "three_times", "four_times", "custom"]),
  times: z.array(z.string()), // Array of times like ["09:00", "21:00"]
  color: z.string().default("#8B5CF6"),
  icon: z.string().default("💊"),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type Medication = z.infer<typeof MedicationSchema>;

export const DayDataSchema = z.object({
  date: z.string(),
  waterIntake: z.number(),
  medicationsTaken: z.array(z.object({
    medicationId: z.string(),
    timesTaken: z.array(z.string()), // Times when medication was taken
    completed: z.boolean(),
  })).default([]),
  goalMet: z.boolean(),
});

export type DayData = z.infer<typeof DayDataSchema>;

export const HydrationDataSchema = z.object({
  waterIntake: z.number().default(0),
  dailyGoal: z.number().default(2.0),
  glassSize: z.number().default(250),
  lastDate: z.string().default(() => new Date().toDateString()),
  streak: z.number().default(0),
  achievements: z.array(z.string()).default([]),
  theme: z.enum(["light", "dark"]).default("light"),
  history: z.array(DayDataSchema).default([]),
  medications: z.array(MedicationSchema).default([
    {
      id: "goodbug",
      name: "GoodBug",
      dosage: "1 pill",
      frequency: "once",
      times: ["09:00"],
      color: "#8B5CF6",
      icon: "🦠",
      active: true,
      notes: "Daily probiotic supplement",
    }
  ]),
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
