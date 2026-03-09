"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GUIDE_STEPS } from "@/lib/guide-steps";

export default function GuidePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  const toggleComplete = (idx: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Brew Guide</h1>
        <p className="text-sm text-muted-foreground">
          Step-by-step instructions for brewing with your Pinter using homebrew
          kits.
        </p>
      </div>

      <div className="space-y-2">
        {GUIDE_STEPS.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          const isDone = completed.has(idx);

          return (
            <Card
              key={idx}
              className={cn(
                "transition-colors",
                isDone && "opacity-75"
              )}
            >
              <CardHeader
                className="cursor-pointer p-4"
                onClick={() => toggleStep(idx)}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(idx);
                    }}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                      isDone
                        ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                  <CardTitle
                    className={cn(
                      "flex-1 text-base",
                      isDone && "line-through"
                    )}
                  >
                    {step.title}
                  </CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  {step.tips.length > 0 && (
                    <div className="mt-3 rounded-lg bg-amber-500/10 p-3">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Tips
                      </div>
                      <ul className="space-y-1.5">
                        {step.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-xs text-amber-800/80 dark:text-amber-300/80"
                          >
                            <CircleDot className="mt-0.5 h-3 w-3 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant={isDone ? "outline" : "default"}
                      onClick={() => toggleComplete(idx)}
                    >
                      {isDone ? "Mark Incomplete" : "Mark Complete"}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
