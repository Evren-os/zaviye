"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorBoundaryProps = {
	children: ReactNode;
	className?: string;
};

type ErrorBoundaryState = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		const { hasError, error } = this.state;
		const { children, className } = this.props;

		if (hasError) {
			return (
				<div className={cn("flex items-center justify-center p-4", className)}>
					<Card className="w-full max-w-md">
						<CardHeader>
							<h2 className="text-xl font-semibold">Something went wrong</h2>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-2">
								An unexpected error occurred. Please try again.
							</p>
							{error && process.env.NODE_ENV === "development" && (
								<details className="mt-4">
									<summary className="cursor-pointer text-sm font-medium">
										Error details
									</summary>
									<pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto">
										{error.message}
										{error.stack && `\n${error.stack}`}
									</pre>
								</details>
							)}
						</CardContent>
						<CardFooter>
							<Button onClick={this.handleReset} className="w-full">
								Try again
							</Button>
						</CardFooter>
					</Card>
				</div>
			);
		}

		return children;
	}
}
