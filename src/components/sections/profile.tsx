"use client";

import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/config/site.config";
import { useLocale } from "@/lib/i18n/locale-context";

export function ProfileSection() {
  const { locale, tr } = useLocale();

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="about"
          title={tr("profileTitle")}
          subtitle={tr("profileSubtitle")}
        />

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.bio[locale].map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {tr("educationLabel")}
            </h3>
            {siteConfig.education.map((item) => (
              <Card key={item.school}>
                <CardHeader className="gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                      <GraduationCap className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.school}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {item.degree[locale]}
                      </CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {item.detail[locale]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
