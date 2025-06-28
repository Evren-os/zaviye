export function LoadingDots() {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-foreground/60 [animation-delay:-0.32s]"></div>
        <div className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-foreground/60 [animation-delay:-0.16s]"></div>
        <div className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-foreground/60"></div>
      </div>
      <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>
    </div>
  )
}
