"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";

export function LocaleToggle() {
  const { locale, setLocale, tr } = useLocale();

  const nextLocale: Locale = locale === "it" ? "en" : "it";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(nextLocale)}
      aria-label={nextLocale === "it" ? tr("langIt") : tr("langEn")}
    >
      {locale.toUpperCase()}
    </Button>
  );
}
