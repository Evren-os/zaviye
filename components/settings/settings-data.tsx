"use client";

import React, { useState } from "react";
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
import type { ChatType } from "@/lib/types";
import { toast } from "sonner";

interface SettingsDataProps {
  activeChat: ChatType;
  clearChatHistoryAction: () => void;
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

export function SettingsData({
  activeChat,
  clearChatHistoryAction,
  onCloseAction,
}: SettingsDataProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleConfirmClearHistory = () => {
    clearChatHistoryAction();
    toast.success("Chat History Cleared", {
      description: "The conversation has been permanently deleted.",
      duration: 3000,
    });
    setIsAlertOpen(false);
    onCloseAction();
  };

  const handleExportHistory = () => {
    try {
      const savedMessages = localStorage.getItem(`zaviye-${activeChat}-messages`);
      if (!savedMessages || JSON.parse(savedMessages).length === 0) {
        toast.warning("No History to Export", {
          description: "There are no messages to export for this tab.",
          duration: 3000,
        });
        return;
      }

      const blob = new Blob([savedMessages], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zaviye-${activeChat}-history-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export Successful", {
        description: "Your chat history has been downloaded.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export Failed", {
        description: "Could not export chat history.",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <div className="p-6 space-y-0">
        {" "}
        <div className="border rounded-lg">
          <SettingItem
            title="Export Chat History"
            description="Download a JSON file of your complete conversation history for the current chat tab."
            control={
              <Button variant="outline" size="sm" onClick={handleExportHistory}>
                Export
              </Button>
            }
          />
          <SettingItem
            title="Delete All Conversations"
            description="Permanently delete all of your conversation data for the current chat tab. This action cannot be undone."
            control={
              <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)}>
                Delete
              </Button>
            }
          />
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will wipe the whole chat history for this tab. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmClearHistory}>
              Yes, delete history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
