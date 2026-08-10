"use client";

import { GithubIcon, LinkedinIcon } from "@/components/icons/social";
import { siteConfig } from "@/config/site.config";
import { useLocale } from "@/lib/i18n/locale-context";

export function Footer() {
  const { tr } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {year} {siteConfig.name}. {tr("footerRights")}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            aria-label={tr("openGithub")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#2563EB]"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
          <a
            href={siteConfig.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={tr("openLinkedin")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#2563EB]"
          >
            <LinkedinIcon className="size-4" />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
