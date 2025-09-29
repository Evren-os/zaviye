"use client";

import { defaultSchema } from "hast-util-sanitize";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism-plus";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

// Extend sanitize schema to allow language classes on code/pre and safe link attrs
const sanitizeSchema: any = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [
			...(defaultSchema.attributes?.code || []),
			["className", "language-*"],
		],
		pre: [
			...(defaultSchema.attributes?.pre || []),
			["className", "language-*", "line-numbers"],
		],
		a: [...(defaultSchema.attributes?.a || []), ["target"], ["rel"]],
	},
};

interface MarkdownProps {
	children: string;
	className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
	return (
		<div className={cn("markdown text-sm leading-relaxed", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypePrism]}
				components={{
					a: (props: any) => (
						<a
							{...props}
							target="_blank"
							rel="noopener noreferrer"
							className="underline underline-offset-2 text-primary hover:opacity-90"
						/>
					),
					h1: (props: any) => (
						<h1
							{...(props as any)}
							className={cn(
								"mt-3 mb-2 text-base font-semibold",
								(props as any).className,
							)}
						/>
					),
					h2: (props: any) => (
						<h2
							{...(props as any)}
							className={cn(
								"mt-3 mb-1.5 text-[0.95rem] font-semibold",
								(props as any).className,
							)}
						/>
					),
					h3: (props: any) => (
						<h3
							{...(props as any)}
							className={cn(
								"mt-2.5 mb-1 text-sm font-medium",
								(props as any).className,
							)}
						/>
					),
					p: (props: any) => (
						<p
							{...(props as any)}
							className={cn("my-2", (props as any).className)}
						/>
					),
					ul: (props: any) => (
						<ul
							{...(props as any)}
							className={cn(
								"my-2 list-disc pl-5 marker:text-muted-foreground",
								(props as any).className,
							)}
						/>
					),
					ol: (props: any) => (
						<ol
							{...(props as any)}
							className={cn(
								"my-2 list-decimal pl-5 marker:text-muted-foreground",
								(props as any).className,
							)}
						/>
					),
					li: (props: any) => (
						<li
							{...(props as any)}
							className={cn("my-0.5", (props as any).className)}
						/>
					),
					blockquote: (props: any) => (
						<blockquote
							{...(props as any)}
							className={cn(
								"my-3 border-l-2 border-border/70 pl-3",
								(props as any).className,
							)}
						/>
					),
					table: (props: any) => (
						<div className="my-3 w-full overflow-x-auto">
							<table
								{...(props as any)}
								className={cn(
									"w-full text-left text-sm border-collapse",
									(props as any).className,
								)}
							/>
						</div>
					),
					th: (props: any) => (
						<th
							{...(props as any)}
							className={cn(
								"border bg-muted/60 px-3 py-2 font-medium text-foreground",
								(props as any).className,
							)}
						/>
					),
					td: (props: any) => (
						<td
							{...(props as any)}
							className={cn(
								"border px-3 py-2 text-foreground/90",
								(props as any).className,
							)}
						/>
					),
					code: (props: any) => {
						const { inline, className, children, ...rest } = props as any;
						const languageMatch = /language-(\w+)/.exec(className || "");
						if (inline) {
							return (
								<code
									{...(rest as any)}
									className={cn(
										"rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]",
										className,
									)}
								>
									{children}
								</code>
							);
						}
						// Block code: delegate to CodeBlock wrapper so we can add copy and collapse UX
						return (
							<code {...(rest as any)} className={className}>
								{children}
							</code>
						);
					},
					pre: (props: any) => {
						// Wrap the highlighted code block with our UX shell
						// @ts-expect-error - props.children is the <code> element from react-markdown
						const child: any = props.children;
						const className: string | undefined = child?.props?.className;
						const languageMatch = /language-(\w+)/.exec(className || "");

						return (
							<CodeBlock
								language={languageMatch?.[1]}
								// @ts-expect-error
								{...props}
							>
								{props.children}
							</CodeBlock>
						);
					},
				}}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}
