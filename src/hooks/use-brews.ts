"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Brew } from "@/lib/types";
import { useAuth } from "./use-auth";
import { createClient } from "@/lib/supabase/client";

interface BrewRow {
  id: string;
  pinter_id: string;
  household_id: string;
  name: string;
  kit_name: string;
  start_date: string;
  fermentation_days: number;
  conditioning_days: number;
  completed_steps: number[];
  created_at: string;
}

function rowToBrew(row: BrewRow): Brew {
  return {
    id: row.id,
    pinterId: row.pinter_id,
    name: row.name,
    kitName: row.kit_name,
    startDate: row.start_date,
    fermentationDays: row.fermentation_days,
    conditioningDays: row.conditioning_days,
    completedSteps: row.completed_steps ?? [],
    createdAt: row.created_at,
  };
}

export function useBrews() {
  const { householdId } = useAuth();
  const [brews, setBrews] = useState<Brew[]>([]);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!householdId) return;

    const fetchBrews = async () => {
      const { data } = await supabase
        .from("brews")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });

      if (data) setBrews(data.map(rowToBrew));
    };

    fetchBrews();

    const channel = supabase
      .channel("brews-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brews",
          filter: `household_id=eq.${householdId}`,
        },
        (payload: RealtimePostgresChangesPayload<BrewRow>) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as BrewRow;
            setBrews((prev) => {
              if (prev.some((b) => b.id === row.id)) return prev;
              return [rowToBrew(row), ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as BrewRow;
            setBrews((prev) =>
              prev.map((b) => (b.id === row.id ? rowToBrew(row) : b))
            );
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as Partial<BrewRow>;
            setBrews((prev) => prev.filter((b) => b.id !== old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, supabase]);

  const addBrew = useCallback(
    async (data: {
      pinterId: string;
      name: string;
      kitName: string;
      startDate: string;
      fermentationDays: number;
      conditioningDays: number;
    }) => {
      if (!householdId) return null;
      const { data: row } = await supabase
        .from("brews")
        .insert({
          household_id: householdId,
          pinter_id: data.pinterId,
          name: data.name,
          kit_name: data.kitName,
          start_date: data.startDate,
          fermentation_days: data.fermentationDays,
          conditioning_days: data.conditioningDays,
        })
        .select()
        .single();

      if (row) {
        const brew = rowToBrew(row);
        return brew;
      }
      return null;
    },
    [householdId, supabase]
  );

  const updateBrew = useCallback(
    async (id: string, updates: Partial<Brew>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.kitName !== undefined) dbUpdates.kit_name = updates.kitName;
      if (updates.startDate !== undefined)
        dbUpdates.start_date = updates.startDate;
      if (updates.fermentationDays !== undefined)
        dbUpdates.fermentation_days = updates.fermentationDays;
      if (updates.conditioningDays !== undefined)
        dbUpdates.conditioning_days = updates.conditioningDays;
      if (updates.completedSteps !== undefined)
        dbUpdates.completed_steps = updates.completedSteps;
      if (updates.pinterId !== undefined)
        dbUpdates.pinter_id = updates.pinterId;

      await supabase.from("brews").update(dbUpdates).eq("id", id);
    },
    [supabase]
  );

  const deleteBrew = useCallback(
    async (id: string) => {
      await supabase.from("brews").delete().eq("id", id);
    },
    [supabase]
  );

  const toggleStep = useCallback(
    async (brewId: string, stepIndex: number) => {
      const brew = brews.find((b) => b.id === brewId);
      if (!brew) return;

      const steps = brew.completedSteps.includes(stepIndex)
        ? brew.completedSteps.filter((s) => s !== stepIndex)
        : [...brew.completedSteps, stepIndex];

      // Optimistic update
      setBrews((prev) =>
        prev.map((b) =>
          b.id === brewId ? { ...b, completedSteps: steps } : b
        )
      );

      await supabase
        .from("brews")
        .update({ completed_steps: steps })
        .eq("id", brewId);
    },
    [brews, supabase]
  );

  return { brews, addBrew, updateBrew, deleteBrew, toggleStep };
}
