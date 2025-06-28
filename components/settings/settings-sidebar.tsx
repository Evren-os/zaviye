"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Database, Globe } from "lucide-react";

export type SettingsTab = "customization" | "data" | "global";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChangeAction: (tab: SettingsTab) => void;
}

const tabs = [
  { id: "global", label: "Global", icon: Globe },
  { id: "customization", label: "Customization", icon: SlidersHorizontal },
  { id: "data", label: "Data Controls", icon: Database },
];

export function SettingsSidebar({ activeTab, onTabChangeAction }: SettingsSidebarProps) {
  return (
    <nav className="p-4 w-full md:w-56 md:border-r">
      <h2 className="mb-4 text-lg font-semibold tracking-tight px-2">Settings</h2>
      <div className="space-y-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === tab.id && "bg-muted hover:bg-muted",
            )}
            onClick={() => onTabChangeAction(tab.id as SettingsTab)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>
    </nav>
  );
}
