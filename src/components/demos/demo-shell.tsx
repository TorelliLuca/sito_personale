"use client";

import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ReactNode } from "react";

interface DemoShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function DemoShell({ title, description, children }: DemoShellProps) {
  const { tr } = useLocale();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-heading text-xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <LinkButton href="/#showcase" variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            {tr("backHome")}
          </LinkButton>
        </div>
      </header>

      <div className="relative flex-1 bg-muted/30">
        <p className="absolute left-4 top-4 z-10 rounded-md bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          {tr("demoControls")}
        </p>
        {children}
      </div>
    </div>
  );
}
