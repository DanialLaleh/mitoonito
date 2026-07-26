export const brand = {
  white: "#FFFFFF",
  gray: "#E6E7E8",
  charcoal: "#434345",
  greenSoft: "#9FD18B",
  green: "#50B848",
  greenDark: "#367639",
} as const;

export const planLimits = {
  FREE: {
    maxAreas: 2,
    maxActiveGoals: 3,
    maxHabits: 5,
    compareHistory: false,
  },
  PREMIUM: {
    maxAreas: 100,
    maxActiveGoals: 100,
    maxHabits: 100,
    compareHistory: true,
  },
} as const;

export const defaultAreas = [
  { title: "روزانه", icon: "sun" },
  { title: "درسی", icon: "book" },
  { title: "ورزشی", icon: "dumbbell" },
  { title: "تغذیه", icon: "apple" },
] as const;
