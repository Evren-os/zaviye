"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();
	const [isPending, startTransition] = React.useTransition();

	const toggleTheme = () => {
		startTransition(() => {
			setTheme(theme === "light" ? "dark" : "light");
		});
	};

	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						disabled={isPending}
						className="h-9 w-9"
					>
						<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Toggle theme</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
