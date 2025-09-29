"use client";

import { BrainCircuit, Database, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{
		title: "AI Model",
		href: "/settings/model",
		icon: BrainCircuit,
	},
	{
		title: "Appearance",
		href: "/settings/appearance",
		icon: Palette,
	},
	{
		title: "Data Management",
		href: "/settings/data-management",
		icon: Database,
	},
];

export function SettingsSidebarNav() {
	const pathname = usePathname();

	return (
		<nav className="flex flex-col gap-1">
			{navItems.map((item) => {
				const Icon = item.icon;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
							pathname.startsWith(item.href)
								? "bg-primary/10 font-semibold text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<Icon className="mr-3 h-5 w-5 shrink-0" />
						<span>{item.title}</span>
					</Link>
				);
			})}
		</nav>
	);
}
