export function LoadingDots() {
	return (
		<div
			className="flex items-center space-x-2"
			role="status"
			aria-live="polite"
			aria-label="Assistant is typing"
		>
			<div className="flex space-x-1">
				<div className="h-1.5 w-1.5 animate-[bounce_1s_ease-in-out_infinite] motion-reduce:animate-none rounded-full bg-foreground/60 [animation-delay:-0.32s]"></div>
				<div className="h-1.5 w-1.5 animate-[bounce_1s_ease-in-out_infinite] motion-reduce:animate-none rounded-full bg-foreground/60 [animation-delay:-0.16s]"></div>
				<div className="h-1.5 w-1.5 animate-[bounce_1s_ease-in-out_infinite] motion-reduce:animate-none rounded-full bg-foreground/60"></div>
			</div>
			<span className="text-xs text-muted-foreground animate-pulse motion-reduce:animate-none">
				Thinking...
			</span>
		</div>
	);
}
