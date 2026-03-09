"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Beer, Plus, Clock, GlassWater } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { usePinters } from "@/hooks/use-pinters";
import { useBrews } from "@/hooks/use-brews";
import {
  getBrewPhase,
  getBrewProgress,
  getNextMilestone,
  formatCountdown,
  getSecondsRemaining,
  getActiveBrew,
} from "@/lib/brew-utils";
import type { Brew } from "@/lib/types";

function ActiveBrewCard({ brew, pinterName }: { brew: Brew; pinterName: string }) {
  const phase = getBrewPhase(brew);
  const milestone = getNextMilestone(brew);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const tick = () => {
      setProgress(getBrewProgress(brew));
      if (milestone) {
        setCountdown(formatCountdown(getSecondsRemaining(milestone.date)));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [brew, milestone]);

  return (
    <Link href={`/brew/${brew.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{brew.name}</CardTitle>
              <CardDescription>{pinterName} &middot; {brew.kitName || "Custom Kit"}</CardDescription>
            </div>
            <StatusBadge status={phase} />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Progress value={progress} className="h-1.5" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            {milestone && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {countdown}
              </span>
            )}
            {phase === "ready" && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <GlassWater className="h-3 w-3" />
                Ready!
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { pinters } = usePinters();
  const { brews } = useBrews();

  const activeBrews = brews.filter((b) => getBrewPhase(b) !== "ready");
  const completedBrews = brews
    .filter((b) => getBrewPhase(b) === "ready")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const idlePinters = pinters.filter((p) => !getActiveBrew(p.id, brews));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your brewing at a glance.
        </p>
      </div>

      {activeBrews.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Active Brews</h2>
          {activeBrews.map((brew) => {
            const pinter = pinters.find((p) => p.id === brew.pinterId);
            return (
              <ActiveBrewCard
                key={brew.id}
                brew={brew}
                pinterName={pinter?.name || "Unknown"}
              />
            );
          })}
        </section>
      )}

      {idlePinters.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Ready to Brew</h2>
          {idlePinters.map((pinter) => (
            <Card key={pinter.id}>
              <CardHeader className="flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Beer className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{pinter.name}</CardTitle>
                    <CardDescription>Idle</CardDescription>
                  </div>
                </div>
                <Link href={`/brew/new?pinterId=${pinter.id}`}>
                  <Button size="sm">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Start Brew
                  </Button>
                </Link>
              </CardHeader>
            </Card>
          ))}
        </section>
      )}

      {activeBrews.length === 0 && idlePinters.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <Beer className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No Pinters set up yet.</p>
            <Link href="/pinters">
              <Button>Manage Pinters</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {completedBrews.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Brew History</h2>
          {completedBrews.map((brew) => {
            const pinter = pinters.find((p) => p.id === brew.pinterId);
            return (
              <Link key={brew.id} href={`/brew/${brew.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{brew.name}</CardTitle>
                        <CardDescription>
                          {pinter?.name} &middot;{" "}
                          {format(new Date(brew.startDate), "d MMM yyyy")}
                        </CardDescription>
                      </div>
                      <StatusBadge status="ready" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
