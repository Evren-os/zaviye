"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsGlobal } from "./settings-global";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export function SettingsModal({ isOpen, onCloseAction }: SettingsModalProps) {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent
        showCloseButton={isMobile}
        className={cn(
          "h-dvh w-screen max-h-dvh max-w-full rounded-none border-none",
          "sm:h-auto sm:max-h-[700px] sm:w-[95vw] sm:max-w-xl sm:rounded-lg sm:border sm:ring-1 sm:ring-primary/40",
          "p-0 flex flex-col gap-0",
        )}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">Global Settings</DialogTitle>
          <DialogDescription>
            Manage application-wide settings and data. These actions affect all personas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <SettingsGlobal onCloseAction={onCloseAction} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
