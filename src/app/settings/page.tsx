"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSettings({ notificationsEnabled: true });
      toast.success("Notifications enabled!");
    } else {
      updateSettings({ notificationsEnabled: false });
      toast.error("Notification permission denied.");
    }
  };

  const handleNotificationToggle = (enabled: boolean) => {
    if (enabled) {
      requestNotificationPermission();
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your brewing defaults and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brew Defaults</CardTitle>
          <CardDescription>
            Default durations when starting a new brew.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-ferm">Fermentation Days</Label>
              <Input
                id="default-ferm"
                type="number"
                min={1}
                max={30}
                value={settings.defaultFermentationDays}
                onChange={(e) =>
                  updateSettings({
                    defaultFermentationDays: parseInt(e.target.value) || 7,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-cond">Conditioning Days</Label>
              <Input
                id="default-cond"
                type="number"
                min={1}
                max={14}
                value={settings.defaultConditioningDays}
                onChange={(e) =>
                  updateSettings({
                    defaultConditioningDays: parseInt(e.target.value) || 3,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Get notified when fermentation or conditioning is complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Push Notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked: boolean) => handleNotificationToggle(checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={theme}
              onChange={(e) =>
                setTheme(e.target.value as "light" | "dark" | "system")
              }
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
          <CardDescription>
            All data is stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure? This will delete all your Pinters, brews, and settings."
                )
              ) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
