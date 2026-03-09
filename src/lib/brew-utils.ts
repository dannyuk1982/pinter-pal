import { addDays, differenceInSeconds, isPast } from "date-fns";
import type { Brew, BrewPhase, PinterStatus } from "./types";

export function getConditioningDate(brew: Brew): Date {
  return addDays(new Date(brew.startDate), brew.fermentationDays);
}

export function getReadyDate(brew: Brew): Date {
  return addDays(
    new Date(brew.startDate),
    brew.fermentationDays + brew.conditioningDays
  );
}

export function getBrewPhase(brew: Brew): BrewPhase {
  const now = new Date();
  const conditioningDate = getConditioningDate(brew);
  const readyDate = getReadyDate(brew);

  if (isPast(readyDate)) return "ready";
  if (isPast(conditioningDate)) return "conditioning";
  return "fermenting";
}

export function getBrewProgress(brew: Brew): number {
  const now = new Date();
  const start = new Date(brew.startDate);
  const end = getReadyDate(brew);
  const totalSeconds = differenceInSeconds(end, start);
  const elapsedSeconds = differenceInSeconds(now, start);

  if (totalSeconds <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));
}

export function getNextMilestone(brew: Brew): {
  label: string;
  date: Date;
} | null {
  const phase = getBrewPhase(brew);
  if (phase === "fermenting") {
    return { label: "Ready to condition", date: getConditioningDate(brew) };
  }
  if (phase === "conditioning") {
    return { label: "Ready to drink", date: getReadyDate(brew) };
  }
  return null;
}

export function getSecondsRemaining(targetDate: Date): number {
  return Math.max(0, differenceInSeconds(targetDate, new Date()));
}

export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Done!";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function getPinterStatus(
  pinter: { id: string },
  brews: Brew[]
): PinterStatus {
  const activeBrew = brews.find((b) => b.pinterId === pinter.id);
  if (!activeBrew) return "idle";
  return getBrewPhase(activeBrew);
}

export function getActiveBrew(
  pinterId: string,
  brews: Brew[]
): Brew | undefined {
  return brews.find((b) => {
    const phase = getBrewPhase(b);
    return b.pinterId === pinterId && phase !== "ready";
  });
}

export const PHASE_COLORS: Record<BrewPhase | "idle", string> = {
  idle: "bg-muted text-muted-foreground",
  fermenting: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  conditioning: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ready: "bg-green-500/15 text-green-700 dark:text-green-400",
};

export const PHASE_LABELS: Record<BrewPhase | "idle", string> = {
  idle: "Idle",
  fermenting: "Fermenting",
  conditioning: "Conditioning",
  ready: "Ready",
};
