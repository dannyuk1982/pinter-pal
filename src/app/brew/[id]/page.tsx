"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
import { BrewTimeline } from "@/components/brew-timeline";
import { CountdownTimer } from "@/components/countdown-timer";
import { useBrews } from "@/hooks/use-brews";
import { usePinters } from "@/hooks/use-pinters";
import {
  getBrewPhase,
  getBrewProgress,
  getNextMilestone,
} from "@/lib/brew-utils";

export default function BrewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { brews, deleteBrew } = useBrews();
  const { pinters } = usePinters();
  const [progress, setProgress] = useState(0);

  const brew = brews.find((b) => b.id === id);
  const pinter = brew ? pinters.find((p) => p.id === brew.pinterId) : null;

  useEffect(() => {
    if (!brew) return;
    setProgress(getBrewProgress(brew));
    const interval = setInterval(() => {
      setProgress(getBrewProgress(brew));
    }, 1000);
    return () => clearInterval(interval);
  }, [brew]);

  if (!brew) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Brew not found.</p>
        <Link href="/">
          <Button variant="link">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const phase = getBrewPhase(brew);
  const milestone = getNextMilestone(brew);

  const handleDelete = () => {
    deleteBrew(brew.id);
    router.push("/");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{brew.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pinter?.name} &middot; {brew.kitName || "Custom Kit"}
          </p>
        </div>
        <StatusBadge status={phase} />
      </div>

      {milestone && (
        <CountdownTimer targetDate={milestone.date} label={milestone.label} />
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progress</CardTitle>
          <CardDescription>
            Started {format(new Date(brew.startDate), "d MMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <BrewTimeline brew={brew} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Fermentation</dt>
            <dd>{brew.fermentationDays} days</dd>
            <dt className="text-muted-foreground">Conditioning</dt>
            <dd>{brew.conditioningDays} days</dd>
            <dt className="text-muted-foreground">Total</dt>
            <dd>{brew.fermentationDays + brew.conditioningDays} days</dd>
          </dl>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={handleDelete}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Delete Brew
      </Button>
    </div>
  );
}
