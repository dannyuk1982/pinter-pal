"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { usePinters } from "@/hooks/use-pinters";
import { useBrews } from "@/hooks/use-brews";
import { useSettings } from "@/hooks/use-settings";
import { getActiveBrew } from "@/lib/brew-utils";
import { format } from "date-fns";

function NewBrewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pinters } = usePinters();
  const { brews, addBrew } = useBrews();
  const { settings } = useSettings();

  const preselectedPinterId = searchParams.get("pinterId") || "";
  const [pinterId, setPinterId] = useState(preselectedPinterId);
  const [name, setName] = useState("");
  const [kitName, setKitName] = useState("");
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [fermentationDays, setFermentationDays] = useState(
    settings.defaultFermentationDays
  );
  const [conditioningDays, setConditioningDays] = useState(
    settings.defaultConditioningDays
  );

  const availablePinters = pinters.filter(
    (p) => !getActiveBrew(p.id, brews)
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinterId || !name.trim() || submitting) return;

    setSubmitting(true);
    const brew = await addBrew({
      pinterId,
      name: name.trim(),
      kitName: kitName.trim(),
      startDate: new Date(startDate).toISOString(),
      fermentationDays,
      conditioningDays,
    });

    if (brew) {
      router.push(`/brew/${brew.id}`);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Start a Brew</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brew Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pinter">Pinter</Label>
              <select
                id="pinter"
                value={pinterId}
                onChange={(e) => setPinterId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="" disabled>
                  Select a Pinter
                </option>
                {availablePinters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {availablePinters.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All Pinters are busy. Wait for one to finish or add a new
                  one.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brew-name">Brew Name</Label>
              <Input
                id="brew-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Session IPA Batch 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kit-name">Kit Name</Label>
              <Input
                id="kit-name"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                placeholder="e.g. Woodforde's Wherry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ferm-days">Fermentation Days</Label>
                <Input
                  id="ferm-days"
                  type="number"
                  min={1}
                  max={30}
                  value={fermentationDays}
                  onChange={(e) =>
                    setFermentationDays(parseInt(e.target.value) || 7)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cond-days">Conditioning Days</Label>
                <Input
                  id="cond-days"
                  type="number"
                  min={1}
                  max={14}
                  value={conditioningDays}
                  onChange={(e) =>
                    setConditioningDays(parseInt(e.target.value) || 3)
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!pinterId || !name.trim() || submitting}
            >
              {submitting ? "Starting..." : "Start Brewing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewBrewPage() {
  return (
    <Suspense>
      <NewBrewForm />
    </Suspense>
  );
}
