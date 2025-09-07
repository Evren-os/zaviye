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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePersonas } from "@/hooks/use-personas";
import type { Message } from "@/lib/types";

const SettingItem = ({
  title,
  description,
  control,
  isDestructive = false,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
  isDestructive?: boolean;
}) => (
  <div className="flex items-center justify-between p-4">
    <div className="space-y-0.5">
      <p className={`font-medium ${isDestructive ? "text-destructive" : ""}`}>{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

export default function DataManagementPage() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { getAllPersonas, getRawCustomPersonas, globalModel } = usePersonas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAllData = () => {
    try {
      const allPersonas = getAllPersonas();
      const customPersonasToExport = getRawCustomPersonas();
      const histories: Record<string, Message[]> = {};

      allPersonas.forEach((persona) => {
        const history = localStorage.getItem(`zaviye-${persona.id}-messages`);
        if (history) {
          histories[persona.id] = JSON.parse(history);
        }
      });

      const dataToExport = {
        globalModel,
        personas: customPersonasToExport,
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
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export Failed", {
        description: "Could not export your data.",
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

        if (data.globalModel) {
          localStorage.setItem("zaviye-global-model", data.globalModel);
        }
        localStorage.setItem("zaviye-custom-personas", JSON.stringify(data.personas));
        Object.entries(data.histories).forEach(([id, history]) => {
          localStorage.setItem(`zaviye-${id}-messages`, JSON.stringify(history));
          localStorage.setItem(`zaviye-${id}-started`, "true");
        });

        toast.success("Import Successful", {
          description: "Your data has been restored. The app will now reload.",
          duration: 3000,
          onDismiss: () => window.location.reload(),
          onAutoClose: () => window.location.reload(),
        });
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Import Failed", {
          description: error instanceof Error ? error.message : "Could not import data.",
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
        duration: 3000,
        onDismiss: () => window.location.reload(),
        onAutoClose: () => window.location.reload(),
      });
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Failed to clear all histories:", error);
      toast.error("Operation Failed", {
        description: "Could not clear all chat histories.",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your application data. Actions here affect all personas.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            <SettingItem
              title="Export All Zaviye Data"
              description="Download a single JSON file with all your data."
              control={
                <Button variant="outline" size="sm" onClick={handleExportAllData}>
                  Export
                </Button>
              }
            />
            <SettingItem
              title="Import Zaviye Data"
              description="Restore data from a backup file."
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
              description="Permanently delete all conversation data."
              isDestructive
              control={
                <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
                  Delete
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will wipe the chat history for ALL personas. This action cannot be undone and
              will reload the application.
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
