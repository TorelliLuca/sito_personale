"use client";

export function UnionFindKirchhoffMedia() {
  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-y-auto bg-background p-2 sm:p-3">
      <img
        src="/visualizations/union-find-kirchhoff/animazione_uf_kirchhoff.gif"
        alt="Animazione: Union-Find cresce come foresta mentre a destra si aggiorna la matrice di incidenza di Kirchhoff"
        className="mx-auto w-full max-w-4xl object-contain"
      />

    </div>
  );
}
