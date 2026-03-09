"use client";

import { v4 as uuid } from "uuid";
import type { Pinter } from "@/lib/types";
import { useLocalStorage } from "./use-local-storage";

const DEFAULT_PINTERS: Pinter[] = [
  { id: "pinter-derry-default", name: "Derry", createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "pinter-jerry-default", name: "Jerry", createdAt: "2024-01-01T00:00:00.000Z" },
];

export function usePinters() {
  const [pinters, setPinters] = useLocalStorage<Pinter[]>(
    "pinter-pal-pinters",
    DEFAULT_PINTERS
  );

  const addPinter = (name: string) => {
    const pinter: Pinter = {
      id: uuid(),
      name,
      createdAt: new Date().toISOString(),
    };
    setPinters((prev) => [...prev, pinter]);
    return pinter;
  };

  const updatePinter = (id: string, name: string) => {
    setPinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const deletePinter = (id: string) => {
    setPinters((prev) => prev.filter((p) => p.id !== id));
  };

  return { pinters, addPinter, updatePinter, deletePinter };
}
