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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePersonas } from "@/hooks/use-personas";
import { ArrowLeft, ArrowUpRight, FilePenLine, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona, ModelId } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "./ui/badge";
import { getModelById, MODELS } from "@/lib/models";

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
            className="font-mono"
          />
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <Label htmlFor="persona-prompt">System Prompt</Label>
          <Textarea
            id="persona-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant that..."
            className="flex-1 resize-none min-h-[240px] font-mono"
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
  const {
    getAllPersonas,
    selectPersona,
    deletePersona,
    createPersona,
    updatePersona,
    getPersona,
    globalModel,
  } = usePersonas();
  const isMobile = useIsMobile();

  const [view, setView] = React.useState<"list" | "edit">("list");
  const [editingPersona, setEditingPersona] = React.useState<Partial<Persona> | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [personaToDelete, setPersonaToDelete] = React.useState<Persona | null>(null);

  const personas = getAllPersonas();

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
      }, 200);
    }
  }, [isOpen]);

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent
            showCloseButton={isMobile}
            className={cn(
              "p-0 shadow-lg overflow-hidden flex flex-col hub-radial-bg",
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
              <Command
                className="flex-1 flex flex-col min-h-0 bg-transparent [&_[cmdk-input-wrapper]]:border-b-0 [&_[cmdk-input-wrapper]]:bg-background/50 [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-12"
                shouldFilter={true}
              >
                <CommandInput placeholder="Search personas..." />
                <CommandList className="flex-1 min-h-0 overflow-y-auto max-h-none p-2">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreate}
                      data-cmdk-item-id="create-new"
                      className="hub-create-item h-[52px] px-4"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Create New Private Chat</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Personas">
                    {personas.map((persona) => {
                      const Icon = persona.icon;
                      const effectiveModelId = persona.model || globalModel;
                      const model = getModelById(effectiveModelId);
                      const isOverride = !!persona.model;

                      return (
                        <CommandItem
                          key={persona.id}
                          value={persona.name}
                          onSelect={() => handleSelect(persona.id)}
                          className="group hub-item h-auto px-4 py-3"
                          data-cmdk-item-id={persona.id}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className="h-5 w-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{persona.name}</span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    variant={isOverride ? "default" : "secondary"}
                                    className="cursor-pointer w-fit mt-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {isOverride
                                      ? model?.name
                                      : `Default: ${getModelById(globalModel)?.name}`}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="start"
                                  className="border border-border/50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {MODELS.map((m) => (
                                    <DropdownMenuItem
                                      key={m.id}
                                      onSelect={() => updatePersona(persona.id, { model: m.id })}
                                    >
                                      {m.name}
                                    </DropdownMenuItem>
                                  ))}
                                  {isOverride && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onSelect={() =>
                                          updatePersona(persona.id, { model: undefined })
                                        }
                                      >
                                        Reset to Global Default
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="ml-auto hidden items-center gap-1 group-hover:flex group-aria-selected:flex">
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
