"use client";

import {
  Brain,
  Code2,
  Cpu,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { languageIcons } from "@/components/icons/languages";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/config/site.config";
import { useLocale } from "@/lib/i18n/locale-context";
import type { TranslationKey } from "@/lib/i18n/translations";

const iconMap: Record<string, LucideIcon> = {
  code: Code2,
  brain: Brain,
  cpu: Cpu,
  rocket: Rocket,
};

export function SkillsSection() {
  const { tr } = useLocale();

  return (
    <section className="border-y border-border/60 bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="skills"
          title={tr("skillsTitle")}
          subtitle={tr("skillsSubtitle")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {siteConfig.skills.map((skill) => {
            const Icon = iconMap[skill.icon];
            return (
              <Card
                key={skill.titleKey}
                className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{tr(skill.titleKey as TranslationKey)}</CardTitle>
                  <CardDescription>
                    {tr(skill.descKey as TranslationKey)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">{tr("languagesLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {siteConfig.languages.map((language) => {
              const { Icon, color } = languageIcons[language];
              const needsDarkWell = language === "JavaScript";
              return (
                <Badge
                  key={language}
                  variant="secondary"
                  className="h-9 gap-2 px-3 text-sm"
                >
                  <span
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-transparent"
                    style={{
                      color,
                      backgroundColor: "transparent",
                    }}
                  >
                    <Icon className="size-3.5!" />
                  </span>
                  {language}
                </Badge>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
