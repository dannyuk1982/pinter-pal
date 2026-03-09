"use client";

import type { AppSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { useLocalStorage } from "./use-local-storage";

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "pinter-pal-settings",
    DEFAULT_SETTINGS
  );

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
