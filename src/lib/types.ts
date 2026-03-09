export type PinterStatus = "idle" | "fermenting" | "conditioning" | "ready";

export interface Pinter {
  id: string;
  name: string;
  createdAt: string;
}

export type BrewPhase = "fermenting" | "conditioning" | "ready";

export interface Brew {
  id: string;
  pinterId: string;
  name: string;
  kitName: string;
  startDate: string;
  fermentationDays: number;
  conditioningDays: number;
  completedSteps: number[];
  createdAt: string;
}

export interface AppSettings {
  defaultFermentationDays: number;
  defaultConditioningDays: number;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultFermentationDays: 7,
  defaultConditioningDays: 3,
  notificationsEnabled: false,
  theme: "system",
};
