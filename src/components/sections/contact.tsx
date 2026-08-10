"use client";

import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/social";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnchorButton } from "@/components/link-button";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/config/site.config";
import { useLocale } from "@/lib/i18n/locale-context";

export function ContactSection() {
  const { tr } = useLocale();

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="contact"
          title={tr("contactTitle")}
          subtitle={tr("contactSubtitle")}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="size-4 text-[#2563EB]" />
                Email
              </CardTitle>
              <CardDescription>{siteConfig.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnchorButton href={`mailto:${siteConfig.email}`} className="w-full">
                {tr("sendEmail")}
              </AnchorButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GithubIcon className="size-4 text-[#2563EB]" />
                GitHub
              </CardTitle>
              <CardDescription>Open source & progetti</CardDescription>
            </CardHeader>
            <CardContent>
              <AnchorButton
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                className="w-full"
              >
                <GithubIcon className="size-4" />
                {tr("openGithub")}
              </AnchorButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LinkedinIcon className="size-4 text-[#2563EB]" />
                LinkedIn
              </CardTitle>
              <CardDescription>Profilo professionale</CardDescription>
            </CardHeader>
            <CardContent>
              <AnchorButton
                href={siteConfig.linkedin}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                className="w-full"
              >
                <LinkedinIcon className="size-4" />
                {tr("openLinkedin")}
              </AnchorButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
