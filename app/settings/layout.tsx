import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSidebarNav } from "@/components/settings/settings-sidebar-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="mb-4 inline-block">
            <Button variant="ghost" className="pl-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account preferences and configuration.
          </p>
        </div>

        {/* Responsive grid: 1 column on mobile, 2 columns on medium screens and up */}
        <div className="grid gap-x-8 gap-y-10 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <aside>
            <SettingsSidebarNav />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
