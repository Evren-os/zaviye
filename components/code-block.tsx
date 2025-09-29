"use client";

import { CheckIcon, ChevronDown, ChevronUp, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
	language?: string;
	children?: React.ReactNode;
}

// Max lines before collapsing
const COLLAPSE_AT = 40;

export function CodeBlock({ language, children }: CodeBlockProps) {
	const [isCopied, setIsCopied] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [lineCount, setLineCount] = useState<number>(0);
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		// After highlight, measure lines from innerText
		const text = preRef.current?.innerText ?? "";
		const lines = text.split("\n").length;
		setLineCount(lines);
		setCollapsed(lines > COLLAPSE_AT);
	}, [children]);

	const handleCopy = async () => {
		try {
			const text = preRef.current?.innerText ?? "";
			await navigator.clipboard.writeText(text);
			toast.success("Code copied to clipboard", { duration: 1500 });
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 1800);
		} catch (error) {
			console.error("Failed to copy code:", error);
			toast.error("Failed to copy code");
		}
	};

	const showToggle = lineCount > COLLAPSE_AT;

	return (
		<TooltipProvider delayDuration={100}>
			<div className="relative my-2 rounded-lg border bg-background/60 font-mono text-sm">
				{/* Language chip */}
				{language && (
					<div className="pointer-events-none absolute left-3 top-2.5 select-none rounded-md border bg-muted/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
						{language}
					</div>
				)}

				{/* Copy button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-2 top-2 h-11 w-11 md:h-7 md:w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
							onClick={handleCopy}
							aria-label="Copy code"
						>
							{isCopied ? (
								<CheckIcon className="h-4 w-4 text-green-500" />
							) : (
								<CopyIcon className="h-4 w-4" />
							)}
							<span className="sr-only">Copy code</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{isCopied ? "Copied!" : "Copy code"}</p>
					</TooltipContent>
				</Tooltip>

				{/* Code content */}
				<div
					className={cn(
						"overflow-hidden",
						collapsed ? "max-h-[360px]" : "max-h-none",
					)}
				>
					<pre
						ref={preRef}
						className="overflow-x-auto p-3 pt-10 md:p-4 md:pt-12"
					>
						{children}
					</pre>
				</div>

				{/* Toggle for long code blocks */}
				{showToggle && (
					<div className="flex justify-center border-t bg-background/60">
						<Button
							variant="ghost"
							size="sm"
							className="h-11 md:h-8 w-full gap-1 text-muted-foreground hover:text-foreground"
							onClick={() => setCollapsed((v) => !v)}
							aria-expanded={!collapsed}
						>
							{collapsed ? (
								<>
									<ChevronDown className="h-4 w-4" /> Show more (
									{lineCount - COLLAPSE_AT} lines)
								</>
							) : (
								<>
									<ChevronUp className="h-4 w-4" /> Show less
								</>
							)}
						</Button>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
