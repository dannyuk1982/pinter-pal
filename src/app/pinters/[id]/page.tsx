"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { usePinters } from "@/hooks/use-pinters";
import { useBrews } from "@/hooks/use-brews";
import {
  getPinterStatus,
  getBrewPhase,
  getConditioningDate,
  getReadyDate,
  PHASE_LABELS,
} from "@/lib/brew-utils";
import { format } from "date-fns";

export default function PinterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { pinters } = usePinters();
  const { brews } = useBrews();

  const pinter = pinters.find((p) => p.id === id);
  if (!pinter) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Pinter not found.</p>
        <Link href="/pinters">
          <Button variant="link">Back to Pinters</Button>
        </Link>
      </div>
    );
  }

  const status = getPinterStatus(pinter, brews);
  const pinterBrews = brews
    .filter((b) => b.pinterId === id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/pinters">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{pinter.name}</h1>
        <StatusBadge status={status} />
      </div>

      {status === "idle" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <p className="text-muted-foreground">
              {pinter.name} is idle. Ready for a new brew!
            </p>
            <Link href={`/brew/new?pinterId=${id}`}>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Start Brew
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {pinterBrews.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Brews</h2>
          {pinterBrews.map((brew) => {
            const phase = getBrewPhase(brew);
            return (
              <Link key={brew.id} href={`/brew/${brew.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{brew.name}</CardTitle>
                      <StatusBadge status={phase} />
                    </div>
                    <CardDescription>
                      {brew.kitName} &middot; Started{" "}
                      {format(new Date(brew.startDate), "d MMM yyyy")}
                      {phase === "fermenting" &&
                        ` · Conditioning ${format(getConditioningDate(brew), "d MMM")}`}
                      {phase === "conditioning" &&
                        ` · Ready ${format(getReadyDate(brew), "d MMM")}`}
                      {phase === "ready" && ` · ${PHASE_LABELS[phase]}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
