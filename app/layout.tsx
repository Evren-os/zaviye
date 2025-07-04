import type React from "react";
import type { Metadata } from "next";
import { fontSans, fontMono } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PersonasProvider } from "@/hooks/use-personas";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Zaviye",
  description: "Stateless AI chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(fontSans.variable, fontMono.variable)}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PersonasProvider>
            {children}
            <Toaster richColors position="top-center" />
          </PersonasProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
