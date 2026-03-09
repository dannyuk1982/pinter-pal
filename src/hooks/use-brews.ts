"use client";

import { v4 as uuid } from "uuid";
import type { Brew } from "@/lib/types";
import { useLocalStorage } from "./use-local-storage";

export function useBrews() {
  const [brews, setBrews] = useLocalStorage<Brew[]>("pinter-pal-brews", []);

  const addBrew = (data: {
    pinterId: string;
    name: string;
    kitName: string;
    startDate: string;
    fermentationDays: number;
    conditioningDays: number;
  }) => {
    const brew: Brew = {
      id: uuid(),
      ...data,
      completedSteps: [],
      createdAt: new Date().toISOString(),
    };
    setBrews((prev) => [...prev, brew]);
    return brew;
  };

  const updateBrew = (id: string, updates: Partial<Brew>) => {
    setBrews((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBrew = (id: string) => {
    setBrews((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleStep = (brewId: string, stepIndex: number) => {
    setBrews((prev) =>
      prev.map((b) => {
        if (b.id !== brewId) return b;
        const steps = b.completedSteps.includes(stepIndex)
          ? b.completedSteps.filter((s) => s !== stepIndex)
          : [...b.completedSteps, stepIndex];
        return { ...b, completedSteps: steps };
      })
    );
  };

  return { brews, addBrew, updateBrew, deleteBrew, toggleStep };
}
