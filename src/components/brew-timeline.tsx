"use client";

import { format } from "date-fns";
import { Check, Clock, FlaskConical, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Brew, BrewPhase } from "@/lib/types";
import {
  getConditioningDate,
  getReadyDate,
  getBrewPhase,
} from "@/lib/brew-utils";

interface TimelineStep {
  label: string;
  date: Date;
  icon: React.ReactNode;
  phase: BrewPhase | "start";
}

export function BrewTimeline({ brew }: { brew: Brew }) {
  const currentPhase = getBrewPhase(brew);
  const startDate = new Date(brew.startDate);
  const conditioningDate = getConditioningDate(brew);
  const readyDate = getReadyDate(brew);

  const steps: TimelineStep[] = [
    {
      label: "Brew Day",
      date: startDate,
      icon: <FlaskConical className="h-4 w-4" />,
      phase: "start",
    },
    {
      label: "Start Conditioning",
      date: conditioningDate,
      icon: <Clock className="h-4 w-4" />,
      phase: "conditioning",
    },
    {
      label: "Ready to Drink",
      date: readyDate,
      icon: <GlassWater className="h-4 w-4" />,
      phase: "ready",
    },
  ];

  const phaseOrder: (BrewPhase | "start")[] = [
    "start",
    "fermenting",
    "conditioning",
    "ready",
  ];
  const currentIdx = phaseOrder.indexOf(currentPhase);

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const stepIdx = i; // start=0, conditioning=1, ready=2
        const isPast = stepIdx < currentIdx || currentPhase === "ready";
        const isCurrent = stepIdx === currentIdx;

        return (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isPast
                    ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                    : isCurrent
                      ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "border-muted bg-muted text-muted-foreground"
                )}
              >
                {isPast ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-8",
                    isPast ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "font-medium text-sm leading-8",
                  isPast
                    ? "text-green-600 dark:text-green-400"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(step.date, "EEE, d MMM yyyy")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
