"use client";

import { useState, useEffect } from "react";
import { getSecondsRemaining, formatCountdown } from "@/lib/brew-utils";

export function CountdownTimer({
  targetDate,
  label,
}: {
  targetDate: Date;
  label: string;
}) {
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(targetDate));

  useEffect(() => {
    setSeconds(getSecondsRemaining(targetDate));
    const interval = setInterval(() => {
      setSeconds(getSecondsRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (seconds <= 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
        {formatCountdown(seconds)}
      </p>
    </div>
  );
}
