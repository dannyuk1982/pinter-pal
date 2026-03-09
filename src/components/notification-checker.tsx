"use client";

import { useEffect, useRef } from "react";
import { useBrews } from "@/hooks/use-brews";
import { useSettings } from "@/hooks/use-settings";
import {
  getBrewPhase,
  getConditioningDate,
  getReadyDate,
} from "@/lib/brew-utils";
import { isPast } from "date-fns";

export function NotificationChecker() {
  const { brews } = useBrews();
  const { settings } = useSettings();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    for (const brew of brews) {
      const phase = getBrewPhase(brew);
      const condKey = `${brew.id}-conditioning`;
      const readyKey = `${brew.id}-ready`;

      if (
        (phase === "conditioning" || phase === "ready") &&
        isPast(getConditioningDate(brew)) &&
        !notifiedRef.current.has(condKey)
      ) {
        notifiedRef.current.add(condKey);
        new Notification("Fermentation Complete!", {
          body: `${brew.name} is ready for conditioning.`,
          icon: "/icons/icon-192.png",
        });
      }

      if (
        phase === "ready" &&
        isPast(getReadyDate(brew)) &&
        !notifiedRef.current.has(readyKey)
      ) {
        notifiedRef.current.add(readyKey);
        new Notification("Beer Ready!", {
          body: `${brew.name} is ready to drink!`,
          icon: "/icons/icon-192.png",
        });
      }
    }
  }, [brews, settings.notificationsEnabled]);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed, PWA features won't work
      });
    }
  }, []);

  return null;
}
