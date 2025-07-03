import { SparklesIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  onOpenHubAction: () => void;
}

export function Header({ onOpenHubAction }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 z-30 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onOpenHubAction}
          className="h-9 text-muted-foreground hover:text-foreground"
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          <span>Persona Hub</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
