"use client";

import { ArrowUpRight, FilePenLine, PlusCircle, Trash2 } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_MODEL_ID } from "@/lib/constants/rate-limits";
import { getModelById, MODELS } from "@/lib/models";
import type { ModelId, Persona } from "@/lib/types";

interface PersonaListProps {
	personas: Persona[];
	onSelect: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onCreate: () => void;
	activeChatId: string;
	onUpdatePersonaModel: (id: string, model: ModelId | undefined) => void;
}

const PersonaListComponent = React.memo(function PersonaList({
	personas,
	onSelect,
	onEdit,
	onDelete,
	onCreate,
	activeChatId,
	onUpdatePersonaModel,
}: PersonaListProps) {
	return (
		<TooltipProvider delayDuration={150}>
			<Command className="flex-1 flex flex-col min-h-0 bg-transparent [&_[cmdk-input-wrapper]]:border-b-0 [&_[cmdk-input-wrapper]]:bg-background/50 [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-12">
				<CommandInput placeholder="Search personas..." />
				<CommandList className="flex-1 min-h-0 overflow-y-auto max-h-none p-2">
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup>
						<CommandItem
							onSelect={onCreate}
							data-cmdk-item-id="create-new"
							className="hub-create-item h-[52px] px-4"
						>
							<PlusCircle className="mr-2 h-4 w-4" />
							<span>Create Persona</span>
						</CommandItem>
					</CommandGroup>

					<CommandGroup heading="Personas">
						{personas.map((persona) => {
							const Icon = persona.icon;
							const effectiveModelId = persona.model || DEFAULT_MODEL_ID;
							const model = getModelById(effectiveModelId);
							const isOverride = !!persona.model;

							return (
								<CommandItem
									key={persona.id}
									value={persona.name}
									onSelect={() => onSelect(persona.id)}
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
															: `Default: ${getModelById(DEFAULT_MODEL_ID)?.name}`}
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
															onSelect={() =>
																onUpdatePersonaModel(persona.id, m.id)
															}
														>
															<div className="flex items-center gap-2">
																<span>{m.name}</span>
															</div>
														</DropdownMenuItem>
													))}
													{isOverride && (
														<>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onSelect={() =>
																	onUpdatePersonaModel(persona.id, undefined)
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
														onSelect(persona.id);
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
														onEdit(persona.id);
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
															onDelete(persona.id);
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
		</TooltipProvider>
	);
});

export { PersonaListComponent as PersonaList };
