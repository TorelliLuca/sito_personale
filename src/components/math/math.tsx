"use client";

import katex from "katex";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MathProps {
  children: string;
  inline?: boolean;
  className?: string;
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return latex;
  }
}

export function Math({ children, inline = false, className }: MathProps) {
  const html = useMemo(
    () => renderLatex(children, !inline),
    [children, inline]
  );

  if (inline) {
    return (
      <span
        className={cn("math-inline", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className={cn("math-display", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface MathBlockProps {
  children: string;
  className?: string;
  centered?: boolean;
}

export function MathBlock({
  children,
  className,
  centered = true,
}: MathBlockProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border/70 bg-muted/40 px-5 py-4",
        centered && "text-center",
        className
      )}
    >
      <Math>{children}</Math>
    </div>
  );
}

interface MathGroupProps {
  children: ReactNode;
  className?: string;
}

export function MathGroup({ children, className }: MathGroupProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
