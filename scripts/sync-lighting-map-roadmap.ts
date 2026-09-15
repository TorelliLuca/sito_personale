import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface SyncConfig {
  repo: string;
  branch: string;
  projectJson: string;
  ignoreShas: string[];
  ignoreMessagePatterns: string[];
  versionOverrides: Record<string, string>;
}

interface LocalizedString {
  it: string;
  en: string;
}

interface ProjectImage {
  src: string;
  alt: string;
  hoverSrc?: string;
  blurDataURL?: string;
}

interface RoadmapEntry {
  version: string;
  title: string | LocalizedString;
  description: string | LocalizedString;
  date?: string;
  commitSha?: string;
  images?: ProjectImage[];
}

interface ProjectJson {
  roadmap?: RoadmapEntry[];
  [key: string]: unknown;
}

interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: { date: string };
  };
}

const VERSION_FROM_SUBJECT = /^v?(\d+\.\d+(?:\.\d+)?)$/i;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(
  ROOT,
  "scripts",
  "lighting-map-roadmap.config.json"
);

function loadConfig(): SyncConfig {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as SyncConfig;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

function parseArgs(argv: string[]): { dryRun: boolean } {
  return { dryRun: argv.includes("--dry-run") };
}

function splitMessage(message: string): { subject: string; body: string } {
  const lines = message.replace(/\r\n/g, "\n").split("\n");
  const subject = (lines[0] ?? "").trim();
  const body = lines.slice(1).join("\n").trim();
  return { subject, body };
}

function cleanSubject(subject: string): string {
  return subject.replace(/^`+|`+$/g, "").trim();
}

function shouldIgnore(
  sha: string,
  subject: string,
  config: SyncConfig
): boolean {
  const short = shortSha(sha);
  const ignored = new Set(
    config.ignoreShas.map((s) => s.toLowerCase().slice(0, 7))
  );
  if (ignored.has(short.toLowerCase()) || ignored.has(sha.toLowerCase())) {
    return true;
  }

  return config.ignoreMessagePatterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(subject);
    } catch {
      console.warn(`Pattern ignore non valido: ${pattern}`);
      return false;
    }
  });
}

async function fetchCommits(
  repo: string,
  branch: string
): Promise<GithubCommit[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sito-personale-roadmap-sync",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const commits: GithubCommit[] = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(
        `GitHub API ${res.status}: ${await res.text().catch(() => res.statusText)}`
      );
    }
    const batch = (await res.json()) as GithubCommit[];
    commits.push(...batch);
    if (batch.length < 100) break;
    page += 1;
    if (page > 20) break;
  }

  return commits;
}

/** Preserva IT curato (stringa legacy o it ≠ en); altrimenti copia EN. */
function pickItalian(
  previous: string | LocalizedString | undefined,
  en: string
): string {
  if (previous == null) return en;
  if (typeof previous === "string") {
    const legacy = previous.trim();
    return legacy || en;
  }
  const it = previous.it?.trim() ?? "";
  const prevEn = previous.en?.trim() ?? "";
  if (it && it !== prevEn) return it;
  return en;
}

function nextInventedVersion(used: Set<string>): string {
  let major = 0;
  let minor = 1;
  let patch = 0;

  while (true) {
    const candidate = `${major}.${minor}.${patch}`;
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
    patch += 1;
    if (patch > 99) {
      patch = 0;
      minor += 1;
    }
    if (minor > 99) {
      minor = 0;
      major += 1;
    }
  }
}

function assignVersions(
  commitsOldestFirst: GithubCommit[],
  config: SyncConfig
): Map<string, string> {
  const versions = new Map<string, string>();
  const used = new Set<string>();

  for (const commit of commitsOldestFirst) {
    const sha = shortSha(commit.sha);
    const override =
      config.versionOverrides[sha] ??
      config.versionOverrides[commit.sha] ??
      null;
    const { subject } = splitMessage(commit.commit.message);
    const cleaned = cleanSubject(subject);
    const match = cleaned.match(VERSION_FROM_SUBJECT);
    const version = override ?? (match ? match[1] : null);
    if (version) {
      versions.set(sha, version);
      used.add(version);
    }
  }

  for (const commit of commitsOldestFirst) {
    const sha = shortSha(commit.sha);
    if (versions.has(sha)) continue;
    versions.set(sha, nextInventedVersion(used));
  }

  return versions;
}

function buildRoadmap(
  commitsNewestFirst: GithubCommit[],
  versionBySha: Map<string, string>,
  existing: RoadmapEntry[]
): RoadmapEntry[] {
  const bySha = new Map<string, RoadmapEntry>();
  const byVersion = new Map<string, RoadmapEntry>();

  for (const entry of existing) {
    if (entry.commitSha) {
      bySha.set(shortSha(entry.commitSha), entry);
    }
    byVersion.set(entry.version, entry);
  }

  return commitsNewestFirst.map((commit) => {
    const sha = shortSha(commit.sha);
    const { subject, body } = splitMessage(commit.commit.message);
    const cleaned = cleanSubject(subject);
    const versionMatch = cleaned.match(VERSION_FROM_SUBJECT);
    const enTitle = versionMatch ? `v${versionMatch[1]}` : cleaned;
    const enDescription = body || cleaned;
    const date = commit.commit.author.date.slice(0, 10);
    const version = versionBySha.get(sha)!;

    const prev = bySha.get(sha) ?? byVersion.get(version);

    const entry: RoadmapEntry = {
      version,
      commitSha: sha,
      title: {
        en: enTitle,
        it: pickItalian(prev?.title, enTitle),
      },
      description: {
        en: enDescription,
        it: pickItalian(prev?.description, enDescription),
      },
      date,
    };

    if (prev?.images?.length) {
      entry.images = prev.images;
    }

    return entry;
  });
}

function stableStringifyRoadmap(roadmap: RoadmapEntry[]): string {
  return JSON.stringify(roadmap, null, 2);
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const projectPath = path.join(ROOT, config.projectJson);

  if (!fs.existsSync(projectPath)) {
    throw new Error(`File progetto non trovato: ${projectPath}`);
  }

  const project = JSON.parse(
    fs.readFileSync(projectPath, "utf8")
  ) as ProjectJson;
  const existing = project.roadmap ?? [];

  const allCommits = await fetchCommits(config.repo, config.branch);
  const filteredNewestFirst = allCommits.filter((commit) => {
    const { subject } = splitMessage(commit.commit.message);
    return !shouldIgnore(commit.sha, cleanSubject(subject), config);
  });

  const oldestFirst = [...filteredNewestFirst].reverse();
  const versionBySha = assignVersions(oldestFirst, config);
  const roadmap = buildRoadmap(filteredNewestFirst, versionBySha, existing);

  console.log(
    `Commit considerate: ${roadmap.length} (ignorate: ${allCommits.length - filteredNewestFirst.length})`
  );
  for (const entry of roadmap) {
    const title =
      typeof entry.title === "string" ? entry.title : entry.title.en;
    console.log(
      `  ${entry.version} | ${entry.date} | ${entry.commitSha} | ${title}`
    );
  }

  const before = stableStringifyRoadmap(existing);
  const after = stableStringifyRoadmap(roadmap);
  if (before === after) {
    console.log("Nessuna modifica alla roadmap.");
    return;
  }

  if (dryRun) {
    console.log("\n--dry-run: nessuna scrittura su disco.");
    console.log(after);
    return;
  }

  project.roadmap = roadmap;
  fs.writeFileSync(
    projectPath,
    `${JSON.stringify(project, null, 2)}\n`,
    "utf8"
  );
  console.log(`\nAggiornato ${config.projectJson}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
