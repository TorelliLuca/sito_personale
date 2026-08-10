"use client";

import { ArrowDown, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { ChladniBackground } from "@/components/chladni-background";
import { GithubIcon, LinkedinIcon } from "@/components/icons/social";
import { AnchorButton } from "@/components/link-button";
import { siteConfig } from "@/config/site.config";
import { useLocale } from "@/lib/i18n/locale-context";

export function HeroSection() {
  const { locale, tr } = useLocale();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <ChladniBackground />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/80 to-background/15 sm:via-background/65" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/15 via-transparent to-background" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {tr("heroGreeting")}
        </p>
        <h1 className="font-heading max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-3 text-xl text-[#2563EB] sm:text-2xl">
          {siteConfig.role[locale]}
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          {tr("heroSubtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <AnchorButton href="#projects" size="lg">
            {tr("heroCtaProjects")}
          </AnchorButton>
          <AnchorButton href="#contact" variant="outline" size="lg">
            <Mail className="size-4" />
            {tr("heroCtaContact")}
          </AnchorButton>
          <AnchorButton href="/visualizzazioni/chladni" variant="ghost" size="lg">
            <Sparkles className="size-4" />
            {tr("heroCtaVisualizations")}
          </AnchorButton>
          <div className="flex items-center gap-2 sm:ml-1">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              aria-label={tr("openGithub")}
              className="inline-flex size-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] transition-colors hover:bg-[#2563EB]/15"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={tr("openLinkedin")}
              className="inline-flex size-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] transition-colors hover:bg-[#2563EB]/15"
            >
              <LinkedinIcon className="size-5" />
            </a>
          </div>
        </div>
        <div className="mt-16 flex justify-center">
          <Link
            href="#about"
            aria-label={tr("about")}
            className="inline-flex animate-bounce text-muted-foreground transition-colors hover:text-foreground motion-reduce:animate-none"
          >
            <ArrowDown className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
