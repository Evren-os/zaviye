import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileImportButtonProps {
	onFileSelect: (file: File) => void;
	accept?: string;
	variant?:
		| "outline"
		| "default"
		| "destructive"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	children?: React.ReactNode;
}

/**
 * Reusable file import button component
 * Handles file input and triggers callback on file selection
 */
export function FileImportButton({
	onFileSelect,
	accept = ".json",
	variant = "outline",
	size = "sm",
	children = "Import",
}: FileImportButtonProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
		// Reset the input value so the same file can be selected again
		event.target.value = "";
	};

	return (
		<>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept={accept}
				className="hidden"
			/>
			<Button variant={variant} size={size} onClick={handleClick}>
				{children}
			</Button>
		</>
	);
}
