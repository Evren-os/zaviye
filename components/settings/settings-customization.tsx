"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsCustomizationProps {
  tabName: string;
  onTabNameChangeAction: (name: string) => void;
  systemPrompt: string;
  onSystemPromptChangeAction: (prompt: string) => void;
}

export function SettingsCustomization({
  tabName,
  onTabNameChangeAction,
  systemPrompt,
  onSystemPromptChangeAction,
}: SettingsCustomizationProps) {
  const { promptLines, promptChars } = useMemo(() => {
    return {
      promptLines: systemPrompt.split("\n").length,
      promptChars: systemPrompt.length,
    };
  }, [systemPrompt]);

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="space-y-2">
        <Label htmlFor="tab-name">Tab Name</Label>
        <Input
          id="tab-name"
          value={tabName}
          onChange={(e) => onTabNameChangeAction(e.target.value)}
          placeholder="e.g., Glitch, My Custom Chat"
        />
      </div>
      <div className="space-y-2 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <div className="text-xs text-muted-foreground font-mono">
            {promptLines} lines / {promptChars} chars
          </div>
        </div>
        <Textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => onSystemPromptChangeAction(e.target.value)}
          placeholder="System prompt for the AI..."
          className="flex-1 resize-none text-xs font-mono min-h-[240px]"
        />
      </div>
    </div>
  );
}