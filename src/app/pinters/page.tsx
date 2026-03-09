"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { usePinters } from "@/hooks/use-pinters";
import { useBrews } from "@/hooks/use-brews";
import { getPinterStatus, getActiveBrew } from "@/lib/brew-utils";

export default function PintersPage() {
  const { pinters, addPinter, updatePinter, deletePinter } = usePinters();
  const { brews } = useBrews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openAdd = () => {
    setEditId(null);
    setName("");
    setDialogOpen(true);
  };

  const openEdit = (id: string, currentName: string) => {
    setEditId(id);
    setName(currentName);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updatePinter(editId, name.trim());
    } else {
      addPinter(name.trim());
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pinters</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button size="sm" />}
            onClick={openAdd}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Pinter
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Pinter" : "Add Pinter"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="pinter-name">Name</Label>
                <Input
                  id="pinter-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Derry"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editId ? "Save" : "Add Pinter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pinters.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No Pinters yet. Add one to get started!
        </p>
      )}

      <div className="space-y-2">
        {pinters.map((pinter) => {
          const status = getPinterStatus(pinter, brews);
          const activeBrew = getActiveBrew(pinter.id, brews);
          return (
            <Card key={pinter.id}>
              <CardHeader className="flex-row items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{pinter.name}</CardTitle>
                    <StatusBadge status={status} />
                  </div>
                  {activeBrew && (
                    <CardDescription className="mt-1">
                      Brewing: {activeBrew.name}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(pinter.id, pinter.name)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deletePinter(pinter.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Link href={`/pinters/${pinter.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
