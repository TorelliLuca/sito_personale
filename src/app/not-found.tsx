import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  description: "La pagina richiesta non esiste o è stata spostata.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Errore 404
      </p>
      <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Pagina non trovata
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        La pagina che stai cercando non esiste, è stata spostata oppure l&apos;URL
        non è corretto.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-10")}
      >
        <Home className="size-4" />
        Torna alla home
      </Link>
    </main>
  );
}
