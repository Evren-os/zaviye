"use client";

import React, { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePersonas } from "@/hooks/use-personas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELS } from "@/lib/models";
import type { ModelId } from "@/lib/types";

interface SettingsGlobalProps {
  onCloseAction: () => void;
}

const SettingItem = ({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) => (
  <div className="flex items-start justify-between rounded-lg p-4 transition-colors hover:bg-muted/50 border-b last:border-b-0">
    <div className="space-y-1 pr-4">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export function SettingsGlobal({ onCloseAction }: SettingsGlobalProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { getAllPersonas, getRawCustomPersonas, globalModel, setGlobalModel } = usePersonas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAllData = () => {
    try {
      const allPersonas = getAllPersonas();
      const customPersonasToExport = getRawCustomPersonas(); // This is the fix
      const histories: Record<string, any> = {};

      allPersonas.forEach((persona) => {
        const history = localStorage.getItem(`zaviye-${persona.id}-messages`);
        if (history) {
          histories[persona.id] = JSON.parse(history);
        }
      });

      const dataToExport = {
        globalModel,
        personas: customPersonasToExport.map(({ icon, ...rest }) => rest), // Export raw custom data
        histories,
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zaviye-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export Successful", {
        description: "All your data has been downloaded.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export Failed", {
        description: "Could not export your data.",
        duration: 3000,
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") throw new Error("Invalid file content");

        const data = JSON.parse(text);
        if (!data.personas || !data.histories) {
          throw new Error("Invalid backup file format.");
        }

        // Import global model if it exists
        if (data.globalModel) {
          localStorage.setItem("zaviye-global-model", data.globalModel);
        }

        // Import personas
        localStorage.setItem("zaviye-custom-personas", JSON.stringify(data.personas));

        // Import histories
        Object.entries(data.histories).forEach(([id, history]) => {
          localStorage.setItem(`zaviye-${id}-messages`, JSON.stringify(history));
          localStorage.setItem(`zaviye-${id}-started`, "true");
        });

        toast.success("Import Successful", {
          description: "Your data has been restored. The app will now reload.",
          duration: 4000,
          onDismiss: () => window.location.reload(),
          onAutoClose: () => window.location.reload(),
        });
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Import Failed", {
          description: error instanceof Error ? error.message : "Could not import data.",
          duration: 4000,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearAllHistory = () => {
    try {
      const personas = getAllPersonas();
      personas.forEach((persona) => {
        localStorage.removeItem(`zaviye-${persona.id}-messages`);
        localStorage.removeItem(`zaviye-${persona.id}-started`);
      });
      toast.success("All Chat Histories Cleared", {
        description: "All conversations have been permanently deleted. The app will reload.",
        duration: 4000,
        onDismiss: () => window.location.reload(),
        onAutoClose: () => window.location.reload(),
      });
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Failed to clear all histories:", error);
      toast.error("Operation Failed", {
        description: "Could not clear all chat histories.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="border rounded-lg">
          <SettingItem
            title="Global AI Model"
            description="Set the default AI model for all personas. This can be overridden per-persona."
            control={
              <Select value={globalModel} onValueChange={(v) => setGlobalModel(v as ModelId)}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </div>
        <div className="border rounded-lg">
          <SettingItem
            title="Export All Zaviye Data"
            description="Download a single JSON file containing all your custom personas and chat histories."
            control={
              <Button variant="outline" size="sm" onClick={handleExportAllData}>
                Export
              </Button>
            }
          />
          <SettingItem
            title="Import Zaviye Data"
            description="Restore your custom personas and chat histories from a previously exported backup file."
            control={
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleImportClick}>
                  Import
                </Button>
              </>
            }
          />
          <SettingItem
            title="Delete All Chat Histories"
            description="Permanently delete all conversation data for every persona. This action cannot be undone."
            control={
              <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
                Delete All
              </Button>
            }
          />
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will wipe the chat history for ALL personas. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmClearAllHistory}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
