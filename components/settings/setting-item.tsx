import type React from "react";

interface SettingItemProps {
	title: string;
	description: string;
	control: React.ReactNode;
	isDestructive?: boolean;
}

/**
 * Reusable setting item component for settings pages
 */
export function SettingItem({
	title,
	description,
	control,
	isDestructive = false,
}: SettingItemProps) {
	return (
		<div className="flex items-center justify-between p-4">
			<div className="space-y-0.5">
				<p className={`font-medium ${isDestructive ? "text-destructive" : ""}`}>
					{title}
				</p>
				<p className="text-sm text-muted-foreground">{description}</p>
			</div>
			<div className="flex-shrink-0">{control}</div>
		</div>
	);
}
