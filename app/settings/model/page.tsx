"use client";

import { useState } from "react";
import { usePersonas } from "@/hooks/use-personas";
import { MODELS } from "@/lib/models";
import type { ModelId } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ModelSettingsPage() {
  const { globalModel, setGlobalModel, getRawCustomPersonas, updatePersona } = usePersonas();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<ModelId | null>(null);

  const customPersonas = getRawCustomPersonas();
  const hasOverrides = customPersonas.some((p) => p.model);

  const handleModelChange = (newModelId: ModelId) => {
    if (hasOverrides) {
      setPendingModel(newModelId);
      setIsAlertOpen(true);
    } else {
      setGlobalModel(newModelId);
      toast.success("Global model updated successfully.");
    }
  };

  const handleConfirmOverride = () => {
    if (pendingModel) {
      customPersonas.forEach((persona) => {
        if (persona.model) {
          updatePersona(persona.id, { model: undefined });
        }
      });
      setGlobalModel(pendingModel);
      toast.success("Global model updated", {
        description: "All per-persona model settings have been reset.",
      });
    }
    setIsAlertOpen(false);
    setPendingModel(null);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global AI Model</CardTitle>
            <CardDescription>
              Set the default AI model for all personas. This can be overridden on a per-persona
              basis from the Persona Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm">
              <Select value={globalModel} onValueChange={(v) => handleModelChange(v as ModelId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="w-fit">
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override Custom Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              You have custom AI models set for one or more personas. Changing the global default
              will reset all of them. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingModel(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverride}>Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
