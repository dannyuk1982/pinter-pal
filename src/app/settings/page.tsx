"use client";

import { useState } from "react";
import { Copy, LogOut, UserPlus } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { user, householdId, signOut } = useAuth();

  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [members, setMembers] = useState<{ id: string; display_name: string }[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);

  const supabase = createClient();

  const loadMembers = async () => {
    if (!householdId || membersLoaded) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("household_id", householdId);
    if (data) {
      setMembers(data);
      setMembersLoaded(true);
    }
  };

  // Load members on first render
  if (householdId && !membersLoaded) {
    loadMembers();
  }

  const generateInviteCode = async () => {
    if (!householdId) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { error } = await supabase.from("invite_codes").insert({
      household_id: householdId,
      code,
    });
    if (error) {
      toast.error("Failed to generate invite code");
    } else {
      setGeneratedCode(code);
      toast.success("Invite code generated!");
    }
  };

  const handleJoinHousehold = async () => {
    if (!joinCode.trim()) return;
    const { error } = await supabase.rpc("join_household", {
      invite_code: joinCode.trim().toUpperCase(),
    });
    if (error) {
      toast.error(error.message || "Invalid or expired invite code");
    } else {
      toast.success("Joined household! Reloading...");
      window.location.reload();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Copied to clipboard");
  };

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
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>
            Signed in as {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-1 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Household</CardTitle>
          <CardDescription>
            Share your pinters and brews with others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Members</Label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-full bg-muted px-3 py-1 text-sm"
                  >
                    {m.display_name || "Unknown"}
                    {m.id === user?.id && " (you)"}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Invite someone</Label>
            {generatedCode ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono">
                  {generatedCode}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={generateInviteCode}>
                <UserPlus className="mr-1 h-4 w-4" />
                Generate Invite Code
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-code" className="text-xs text-muted-foreground">
              Join a household
            </Label>
            <div className="flex gap-2">
              <Input
                id="join-code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter invite code"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleJoinHousehold}
                disabled={!joinCode.trim()}
              >
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
