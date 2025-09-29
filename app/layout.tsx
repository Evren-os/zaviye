import type { Metadata } from "next";
import type React from "react";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PersonasProvider } from "@/hooks/use-personas";

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
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(fontSans.variable, fontMono.variable)}
		>
			<body className="font-sans" suppressHydrationWarning={true}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
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
