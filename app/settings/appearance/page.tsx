"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AppearanceSettingsPage() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						Customize the look and feel of the application. Select your
						preferred theme.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							className={cn(
								"h-auto justify-start p-4",
								theme === "light" && "border-primary/50",
							)}
							onClick={() => setTheme("light")}
						>
							<Sun className="mr-3 h-5 w-5" />
							<span className="font-medium">Light</span>
						</Button>
						<Button
							variant="outline"
							className={cn(
								"h-auto justify-start p-4",
								theme === "dark" && "border-primary/50",
							)}
							onClick={() => setTheme("dark")}
						>
							<Moon className="mr-3 h-5 w-5" />
							<span className="font-medium">Dark</span>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
