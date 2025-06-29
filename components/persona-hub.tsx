"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePersonas } from "@/hooks/use-personas";
import { ArrowLeft, ArrowUpRight, FilePenLine, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

interface PersonaHubProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPersona: (id: string) => void;
  activeChatId: string;
}

function PersonaEditorForm({
  persona,
  onSave,
  onBack,
}: {
  persona: Partial<Persona> | null;
  onSave: (data: { name: string; prompt: string }) => void;
  onBack: () => void;
}) {
  const [name, setName] = React.useState(persona?.name || "");
  const [prompt, setPrompt] = React.useState(persona?.prompt || "");

  const handleSaveClick = () => {
    if (name.trim() && prompt.trim()) {
      onSave({ name, prompt });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-4 border-b flex-row items-center">
        <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DialogTitle>{persona?.id ? "Edit Persona" : "Create New Persona"}</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="persona-name">Name</Label>
          <Input
            id="persona-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Code Reviewer"
          />
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <Label htmlFor="persona-prompt">System Prompt</Label>
          <Textarea
            id="persona-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant that..."
            className="flex-1 resize-none min-h-[240px]"
          />
        </div>
      </div>
      <DialogFooter className="p-4 border-t">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSaveClick} disabled={!name.trim() || !prompt.trim()}>
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

export function PersonaHub({
  isOpen,
  onOpenChange,
  onSelectPersona,
  activeChatId,
}: PersonaHubProps) {
  const { getAllPersonas, selectPersona, deletePersona, createPersona, updatePersona, getPersona } =
    usePersonas();
  const isMobile = useIsMobile();

  const [view, setView] = React.useState<"list" | "edit">("list");
  const [editingPersona, setEditingPersona] = React.useState<Partial<Persona> | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [personaToDelete, setPersonaToDelete] = React.useState<Persona | null>(null);
  const [hoveredPersonaId, setHoveredPersonaId] = React.useState<string | null>(null);

  const personas = getAllPersonas();
  const hoveredPersona = getPersona(hoveredPersonaId || "");
  const commandRef = React.useRef<HTMLDivElement>(null);

  const runCommand = React.useCallback(
    (command: () => void) => {
      command();
      onOpenChange(false);
    },
    [onOpenChange],
  );

  const handleSelect = (id: string) => {
    runCommand(() => {
      onSelectPersona(id);
      selectPersona(id);
    });
  };

  const handleEdit = (id: string) => {
    const persona = getPersona(id);
    if (persona) {
      setEditingPersona(persona);
      setView("edit");
    }
  };

  const handleDelete = (id: string) => {
    const persona = getPersona(id);
    if (persona && !persona.isDefault) {
      setPersonaToDelete(persona);
      setIsAlertOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (personaToDelete) {
      const isDeletingActive = personaToDelete.id === activeChatId;
      deletePersona(personaToDelete.id);
      setIsAlertOpen(false);
      setPersonaToDelete(null);
      if (isDeletingActive) {
        // If the active persona was deleted, fall back to the default
        onSelectPersona("glitch");
      }
    }
  };

  const handleCreate = () => {
    setEditingPersona(null);
    setView("edit");
  };

  const handleSave = (data: { name: string; prompt: string }) => {
    if (editingPersona?.id) {
      updatePersona(editingPersona.id, data);
    } else {
      const newId = createPersona(data);
      onSelectPersona(newId);
    }
    setView("list");
    setEditingPersona(null);
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("list");
        setEditingPersona(null);
        setHoveredPersonaId(null);
      }, 200);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || view !== "list" || !hoveredPersonaId) return;

      if (
        document.activeElement?.tagName.toLowerCase() !== "body" &&
        document.activeElement !== commandRef.current
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(hoveredPersonaId);
      }
      if (e.key === "e" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleEdit(hoveredPersonaId);
      }
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleDelete(hoveredPersonaId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, view, hoveredPersonaId, handleSelect, handleEdit, handleDelete]);

  const Keybind = ({ children }: { children: React.ReactNode }) => (
    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground font-sans">
      {children}
    </kbd>
  );

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent
            showCloseButton={isMobile}
            className={cn(
              "p-0 shadow-lg overflow-hidden flex flex-col",
              isMobile
                ? "h-dvh w-screen max-h-dvh max-w-full rounded-none border-none"
                : "w-[95vw] max-w-[640px] h-[70vh] max-h-[550px] rounded-lg",
            )}
            onInteractOutside={(e) => {
              if (view === "edit") e.preventDefault();
            }}
          >
            <DialogTitle className="sr-only">Persona Hub</DialogTitle>
            {view === "list" ? (
              <>
                <Command
                  ref={commandRef}
                  className="flex-1 flex flex-col min-h-0 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                  shouldFilter={true}
                >
                  <CommandInput placeholder="Search..." />
                  <CommandList className="flex-1 min-h-0 overflow-y-auto max-h-none">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleCreate}
                        data-cmdk-item-id="create-new"
                        className="h-[52px]"
                      >
                        <PlusCircle />
                        <span>Create New Private Chat</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Today">
                      {personas.map((persona) => {
                        const Icon = persona.icon;
                        return (
                          <CommandItem
                            key={persona.id}
                            value={persona.name}
                            onSelect={() => handleSelect(persona.id)}
                            className="group h-[52px]"
                            data-cmdk-item-id={persona.id}
                            onMouseEnter={() => setHoveredPersonaId(persona.id)}
                            onMouseLeave={() => setHoveredPersonaId(null)}
                          >
                            <div className="flex items-center gap-3">
                              <Icon />
                              <span>{persona.name}</span>
                            </div>
                            <div className="ml-auto hidden items-center gap-2 group-hover:flex group-aria-selected:flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelect(persona.id);
                                    }}
                                  >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Open Chat</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(persona.id);
                                    }}
                                  >
                                    <FilePenLine className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                              {!persona.isDefault && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(persona.id);
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
                <DialogFooter className="p-2 border-t text-xs text-muted-foreground h-9 flex items-center justify-end">
                  <div
                    className={cn(
                      "flex items-center gap-4 transition-opacity",
                      hoveredPersonaId ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <span>
                      Open Chat <Keybind>↵</Keybind>
                    </span>
                    <span>
                      Edit <Keybind>⌘E</Keybind>
                    </span>
                    {!hoveredPersona?.isDefault && (
                      <span>
                        Delete <Keybind>⌘D</Keybind>
                      </span>
                    )}
                  </div>
                </DialogFooter>
              </>
            ) : (
              <PersonaEditorForm
                persona={editingPersona}
                onSave={handleSave}
                onBack={() => setView("list")}
              />
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the '{personaToDelete?.name}' persona. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}