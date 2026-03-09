"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Pinter } from "@/lib/types";
import { useAuth } from "./use-auth";
import { createClient } from "@/lib/supabase/client";

interface PinterRow {
  id: string;
  household_id: string;
  name: string;
  created_at: string;
}

function rowToPinter(row: PinterRow): Pinter {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function usePinters() {
  const { householdId } = useAuth();
  const [pinters, setPinters] = useState<Pinter[]>([]);
  const [supabase] = useState(() => createClient());

  // Fetch pinters on mount
  useEffect(() => {
    if (!householdId) return;

    const fetchPinters = async () => {
      const { data } = await supabase
        .from("pinters")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at");

      if (data) setPinters(data.map(rowToPinter));
    };

    fetchPinters();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("pinters-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pinters",
          filter: `household_id=eq.${householdId}`,
        },
        (payload: RealtimePostgresChangesPayload<PinterRow>) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as PinterRow;
            setPinters((prev) => {
              if (prev.some((p) => p.id === row.id)) return prev;
              return [...prev, rowToPinter(row)];
            });
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as PinterRow;
            setPinters((prev) =>
              prev.map((p) => (p.id === row.id ? rowToPinter(row) : p))
            );
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as Partial<PinterRow>;
            setPinters((prev) => prev.filter((p) => p.id !== old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, supabase]);

  const addPinter = useCallback(
    async (name: string) => {
      if (!householdId) return null;
      const { data } = await supabase
        .from("pinters")
        .insert({ household_id: householdId, name })
        .select()
        .single();

      if (data) {
        const pinter = rowToPinter(data);
        return pinter;
      }
      return null;
    },
    [householdId, supabase]
  );

  const updatePinter = useCallback(
    async (id: string, name: string) => {
      await supabase.from("pinters").update({ name }).eq("id", id);
    },
    [supabase]
  );

  const deletePinter = useCallback(
    async (id: string) => {
      await supabase.from("pinters").delete().eq("id", id);
    },
    [supabase]
  );

  return { pinters, addPinter, updatePinter, deletePinter };
}
