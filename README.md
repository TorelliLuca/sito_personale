# Sito Portfolio Personale

Portfolio personale costruito con Next.js, Tailwind CSS, shadcn/ui e demo interattive Three.js.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Three Fiber per le demo 3D
- Contenuti in JSON (`content/projects/`) + asset in `public/projects/`

## Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:5000](http://localhost:5000).

## Aggiungere un progetto (API locale)

1. Avvia il dev server: `npm run dev`
2. Esegui lo script:

```bash
npx tsx scripts/add-project.ts --title "RL Viz" --desc "Descrizione del progetto" --tags "rl,threejs" --type hybrid --demo rl-visualization --featured --images ./screens/01.png ./screens/02.png
```

Su Windows, se `npm run add-project -- ...` non passa gli argomenti, usa direttamente `npx tsx scripts/add-project.ts`.

Lo script invia una richiesta a `POST /api/projects`, salva:

- immagini in `public/projects/[slug]/`
- metadati in `content/projects/[slug].json`
- blur placeholder per caricamento rapido

3. Verifica in browser, poi committa e pusha:

```bash
git add content/projects public/projects
git commit -m "Aggiungi progetto RL Viz"
git push
```

### Parametri CLI

| Flag | Descrizione |
|------|-------------|
| `--title` | Titolo (obbligatorio) |
| `--desc` | Descrizione |
| `--tags` | Tag separati da virgola |
| `--type` | `gallery`, `demo`, `hybrid` |
| `--demo` | Slug demo Three.js (es. `rl-visualization`) |
| `--featured` | Segna come progetto in evidenza |
| `--github` | URL repository |
| `--live` | URL demo live |
| `--images` | Percorsi file o cartella |
| `--hover-image` | GIF (o immagine) mostrata al passaggio del mouse / al tocco sulla card |

## Modificare un progetto esistente

I progetti sono file JSON in `content/projects/`. Per modificarne uno:

1. Apri `content/projects/[slug].json` (es. `rl-visualization.json`)
2. Modifica i campi desiderati:

| Campo | Descrizione |
|-------|-------------|
| `title` | Titolo mostrato sulla card e nella pagina dettaglio |
| `description` | Testo descrittivo |
| `tags` | Array di tag per filtri e badge |
| `type` | `gallery`, `demo` o `hybrid` |
| `demoSlug` | Slug demo interattiva (es. `rl-visualization`) o `null` |
| `featured` | `true` per metterlo in evidenza |
| `links.github` / `links.live` | URL opzionali |
| `images` | Array di immagini di copertina/galleria (vedi sotto) |
| `roadmap` | Array di versioni della roadmap (vedi sotto) |
| `createdAt` | Data ISO (`YYYY-MM-DD`), usata per l'ordinamento |

3. Per cambiare le immagini, aggiungi i file in `public/projects/[slug]/` e aggiorna l'array `images`:

```json
"images": [
  {
    "src": "/projects/rl-visualization/01.png",
    "alt": "Anteprima statica",
    "hoverSrc": "/projects/rl-visualization/hover.gif",
    "blurDataURL": "..."
  }
]
```

- `src`: immagine di copertina (prima della lista = anteprima sulla card)
- `hoverSrc`: **opzionale** — GIF mostrata al passaggio del mouse (desktop) o mentre tieni premuto il dito (mobile)
- `blurDataURL`: placeholder sfocato per il caricamento (opzionale)

4. Riavvia o ricarica il dev server e verifica in browser, poi committa:

```bash
git add content/projects public/projects
git commit -m "Aggiorna progetto RL Visualization"
```

> **Nota:** non c'è un'API di modifica — per progetti già pubblicati conviene editare direttamente il JSON e gli asset in `public/projects/`.

### Aggiungere una GIF hover a un progetto esistente

1. Copia la GIF in `public/projects/[slug]/hover.gif`
2. Nel JSON, aggiungi `hoverSrc` alla **prima** immagine dell'array:

```json
"hoverSrc": "/projects/rl-visualization/hover.gif"
```

La card mostrerà l'immagine statica di default; passando il mouse (desktop) o tenendo premuto (mobile) apparirà la GIF animata.

### Roadmap del progetto

Nella pagina dettaglio (`/projects/[slug]`) compaiono la **descrizione** e, sotto, la **roadmap**: la sequenza di versioni e scelte che hanno portato allo stato attuale. Ogni versione può avere foto e testo.

Nel JSON, aggiungi (o estendi) l'array `roadmap`:

```json
"roadmap": [
  {
    "version": "0.1",
    "title": { "it": "Prototipo", "en": "Prototype" },
    "description": {
      "it": "Prime scelte e MVP.",
      "en": "Early choices and MVP."
    },
    "date": "2026-05-12",
    "images": [
      {
        "src": "/projects/rl-visualization/roadmap/v0.1-01.png",
        "alt": "Screenshot del prototipo"
      }
    ]
  },
  {
    "version": "1.0",
    "title": "Versione attuale",
    "description": "Demo interattiva e pagina portfolio.",
    "date": "2026-08-10"
  }
]
```

| Campo | Descrizione |
|-------|-------------|
| `version` | Etichetta versione (`0.1`, `1.0`, `v2`, …) |
| `title` | Titolo breve: stringa oppure `{ "it", "en" }` |
| `description` | Descrizione: stringa oppure `{ "it", "en" }` |
| `date` | Data ISO opzionale (`YYYY-MM-DD`); ordina la timeline |
| `commitSha` | Opzionale; SHA commit di origine (sync GitHub) |
| `images` | Array opzionale di foto (stesso formato di `images` del progetto) |

Suggerimento: metti le foto di versione in `public/projects/[slug]/roadmap/` (es. `v0.1-01.png`) e riferiscile nel JSON. L'ultima tappa (per data/ordine) viene evidenziata come **Attuale**.

### Sync roadmap Lighting Map (GitHub Actions)

La roadmap di **Lighting Map** si aggiorna dalle commit su `main` del repo [Lighting-map](https://github.com/TorelliLuca/Lighting-map):

- Workflow: `.github/workflows/sync-lighting-map-roadmap.yml` (cron giornaliero + `workflow_dispatch`)
- Script locale: `npm run sync-lighting-map-roadmap` (aggiungi `-- --dry-run` per anteprima)
- Ignore SHA/pattern e override versione: [`scripts/lighting-map-roadmap.config.json`](scripts/lighting-map-roadmap.config.json)

Al sync, `en` viene dal messaggio di commit e `it` parte come copia di `en`. Se ritocchi l’italiano nel JSON (`it` ≠ `en`), il prossimo sync **preserva** quel testo grazie a `commitSha`.

## Demo Three.js

Le demo interattive vivono in `/demos/[slug]`. Per aggiungerne una nuova:

1. Crea il componente in `src/components/demos/`
2. Registralo in `src/lib/demos.ts` e in `src/components/demos/demo-loader.tsx`
3. Collega il progetto con `--demo slug` nello script add-project

### Artificial City · replay JSON (PPO)

La demo `/demos/rl-visualization` **non** esegue PPO nel browser: riproduce un episodio JSON esportato offline da Artificial City.

Il file statico vive in `public/projects/artificial-city/episodes/demo.json` (committalo e pusha: Vercel lo serve così com’è). Per aggiornarlo, riesporta dal repo di simulazione e sostituisci quel JSON.

Schema (`schemaVersion: 1`), allineato a `SimulationRunner.get_state_snapshot()`:

```json
{
  "schemaVersion": 1,
  "meta": {
    "grid_size": 40,
    "day_length": 480,
    "seed": 42,
    "policy": "RuleBasedPolicy",
    "ticks_simulated": 600,
    "stride": 2
  },
  "buildings": [{ "id": 0, "x": 3, "y": 5, "type": "home", "tiles": [[3,5]], "size": 1 }],
  "frames": [
    {
      "tick": 0,
      "agents": [{ "id": 16, "x": 3, "y": 5, "action": "idle", "hunger": 0, "energy": 100, "money": 1000, "happiness": 50 }],
      "metrics": { "gini_coefficient": 0.02, "mean_happiness": 50 },
      "agents_alive": 12
    }
  ]
}
```

Tipi: `src/lib/demos/city-episode.ts` · validazione Zod: `src/lib/types/rl-episode.ts`.  
Viewer Three.js: port di `Artifical_city/web/3d` in `src/components/demos/artificial-city/` (stesso `CityScene.applySnapshot`, feed da JSON invece che WebSocket).

## Deploy (GitHub + Vercel)

Il sito è pensato per il deploy continuo: ogni push su `main` aggiorna la produzione; i push su altri branch (o le PR) generano preview automatiche.

1. Pusha su GitHub (`main`)
2. Collega il repository a Vercel (Import Project o `vercel git connect`)
3. Framework: **Next.js** (rilevato automaticamente) — Build Command `npm run build`
4. (Opzionale) Imposta `LOCAL_API_SECRET` nelle Environment Variables di Vercel

Dopo il collegamento Git non serve più deployare a mano: basta `git push`.

Produzione: [luca-torelli.vercel.app](https://luca-torelli.vercel.app) · Repo: [TorelliLuca/sito_personale](https://github.com/TorelliLuca/sito_personale)

> L'API di upload (`POST /api/projects`) funziona in locale. Su Vercel il filesystem è read-only: aggiungi progetti in dev, committa i file generati, poi pusha.

## Personalizzazione

Modifica i dati del sito in [`src/config/site.config.ts`](src/config/site.config.ts):

- nome, email, GitHub, LinkedIn
- competenze e linguaggi

## Script utili

```bash
npm run dev                        # dev server
npm run build                      # build produzione
npm run start                      # avvia build
npm run lint                       # ESLint
npm run add-project                # aggiungi card progetto via API locale
npm run sync-lighting-map-roadmap  # sync roadmap Lighting Map da GitHub
```
