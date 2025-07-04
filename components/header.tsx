import { SparklesIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onOpenHubAction: () => void;
}

export function Header({ onOpenHubAction }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 z-30 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button onClick={onOpenHubAction} className="hub-pill-button">
          <SparklesIcon className="h-4 w-4" />
          <span>Persona Hub</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
