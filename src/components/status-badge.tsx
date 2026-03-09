"use client";

import { Badge } from "@/components/ui/badge";
import { PHASE_COLORS, PHASE_LABELS } from "@/lib/brew-utils";
import type { PinterStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: PinterStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium", PHASE_COLORS[status])}
    >
      {PHASE_LABELS[status]}
    </Badge>
  );
}
