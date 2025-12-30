"use client";

import type { Schema } from "hast-util-sanitize";
import type { ReactNode } from "react";
import type {
	AnchorHTMLAttributes,
	HTMLAttributes,
	TableHTMLAttributes,
	ThHTMLAttributes,
	TdHTMLAttributes,
} from "react";
import { defaultSchema } from "hast-util-sanitize";
import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism-plus";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

// Extend sanitize schema to allow language classes on code/pre and safe link attrs
const sanitizeSchema: Schema = {
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

interface CodeProps extends HTMLAttributes<HTMLElement> {
	inline?: boolean;
}

export function Markdown({ children, className }: MarkdownProps) {
	return (
		<div className={cn("markdown text-sm leading-relaxed", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[[rehypeSanitize, sanitizeSchema], rehypePrism]}
				components={{
					a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
						<a
							{...props}
							target="_blank"
							rel="noopener noreferrer"
							className="underline underline-offset-2 text-primary hover:opacity-90"
						/>
					),
					h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
						<h1
							{...props}
							className={cn(
								"mt-3 mb-2 text-base font-semibold",
								props.className,
							)}
						/>
					),
					h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
						<h2
							{...props}
							className={cn(
								"mt-3 mb-1.5 text-[0.95rem] font-semibold",
								props.className,
							)}
						/>
					),
					h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
						<h3
							{...props}
							className={cn("mt-2.5 mb-1 text-sm font-medium", props.className)}
						/>
					),
					p: (props: HTMLAttributes<HTMLParagraphElement>) => (
						<p {...props} className={cn("my-2", props.className)} />
					),
					ul: (props: HTMLAttributes<HTMLUListElement>) => (
						<ul
							{...props}
							className={cn(
								"my-2 list-disc pl-5 marker:text-muted-foreground",
								props.className,
							)}
						/>
					),
					ol: (props: HTMLAttributes<HTMLOListElement>) => (
						<ol
							{...props}
							className={cn(
								"my-2 list-decimal pl-5 marker:text-muted-foreground",
								props.className,
							)}
						/>
					),
					li: (props: HTMLAttributes<HTMLLIElement>) => (
						<li {...props} className={cn("my-0.5", props.className)} />
					),
					blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
						<blockquote
							{...props}
							className={cn(
								"my-3 border-l-2 border-border/70 pl-3",
								props.className,
							)}
						/>
					),
					table: (props: TableHTMLAttributes<HTMLTableElement>) => (
						<div className="my-3 w-full overflow-x-auto">
							<table
								{...props}
								className={cn(
									"w-full text-left text-sm border-collapse",
									props.className,
								)}
							/>
						</div>
					),
					th: (props: ThHTMLAttributes<HTMLTableCellElement>) => (
						<th
							{...props}
							className={cn(
								"border bg-muted/60 px-3 py-2 font-medium text-foreground",
								props.className,
							)}
						/>
					),
					td: (props: TdHTMLAttributes<HTMLTableCellElement>) => (
						<td
							{...props}
							className={cn(
								"border px-3 py-2 text-foreground/90",
								props.className,
							)}
						/>
					),
					code: (props: CodeProps) => {
						const { inline, className, children, ...rest } = props;
						const _languageMatch = /language-(\w+)/.exec(className || "");
						if (inline) {
							return (
								<code
									{...rest}
									className={cn(
										"rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]",
										className,
									)}
								>
									{children}
								</code>
							);
						}
						return (
							<code {...rest} className={className}>
								{children}
							</code>
						);
					},
					pre: (
						props: HTMLAttributes<HTMLPreElement> & { children?: ReactNode },
					) => {
						const child = props.children as
							| { props?: { className?: string } }
							| undefined;
						const className = child?.props?.className;
						const languageMatch = /language-(\w+)/.exec(className || "");

						return (
							<CodeBlock language={languageMatch?.[1]} {...props}>
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
