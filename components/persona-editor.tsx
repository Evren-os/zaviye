"use client";

import { ArrowLeft } from "lucide-react";
import React, { useId } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Persona } from "@/lib/types";

interface PersonaEditorProps {
	persona: Partial<Persona> | null;
	onSave: (data: { name: string; prompt: string }) => void;
	onBack: () => void;
}

const PersonaEditorComponent = React.memo(function PersonaEditor({
	persona,
	onSave,
	onBack,
}: PersonaEditorProps) {
	const [name, setName] = React.useState(persona?.name || "");
	const [prompt, setPrompt] = React.useState(persona?.prompt || "");
	const nameId = useId();
	const promptId = useId();

	const handleSaveClick = () => {
		if (name.trim() && prompt.trim()) {
			onSave({ name, prompt });
		}
	};

	return (
		<div className="flex flex-col h-full">
			<DialogHeader className="p-4 border-b flex-row items-center">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 mr-2"
					onClick={onBack}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<DialogTitle>
					{persona?.id ? "Edit Persona" : "Create New Persona"}
				</DialogTitle>
			</DialogHeader>
			<div className="p-4 space-y-4 flex-1 overflow-y-auto">
				<div className="space-y-2">
					<Label htmlFor={nameId}>Name</Label>
					<Input
						id={nameId}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Code Reviewer"
						className="font-mono"
					/>
				</div>
				<div className="space-y-2 flex-1 flex flex-col">
					<Label htmlFor={promptId}>System Prompt</Label>
					<Textarea
						id={promptId}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="You are a helpful AI assistant that..."
						className="flex-1 resize-none min-h-[240px] font-mono"
					/>
				</div>
			</div>
			<div className="p-4 border-t flex justify-end space-x-2">
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>
				<Button
					onClick={handleSaveClick}
					disabled={!name.trim() || !prompt.trim()}
				>
					Save
				</Button>
			</div>
		</div>
	);
});

export { PersonaEditorComponent as PersonaEditor };
