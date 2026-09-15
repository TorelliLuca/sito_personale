/** Schema episodio Artificial City (export JSON → replay Three.js). */

export interface EpisodeMeta {
  grid_size: number;
  day_length: number;
  seed?: number | null;
  policy?: string;
  config?: string;
  model?: string | null;
  ticks_simulated?: number;
  stride?: number;
  agents_initial?: number;
  frame_count?: number;
}

export interface EpisodeAgent {
  id: number;
  name?: string;
  x: number;
  y: number;
  target_x?: number;
  target_y?: number;
  hunger?: number;
  energy?: number;
  money?: number;
  happiness?: number;
  action?: string;
  activity?: string | null;
  home_id?: number;
  work_id?: number;
}

export interface EpisodeBuilding {
  id: number;
  x: number;
  y: number;
  cx?: number;
  cy?: number;
  type: string;
  occupants?: number;
  capacity?: number;
  bankrupt?: boolean;
  price?: number;
  wage?: number;
  stock?: number;
  goods?: number;
  owner_id?: number | null;
  created_tick?: number;
  tiles?: number[][];
  size?: number;
}

export interface EpisodeMetrics {
  gini_coefficient?: number;
  shannon_entropy?: number;
  economic_temperature?: number;
  total_money_supply?: number;
  mean_wealth?: number;
  mean_hunger?: number;
  mean_energy?: number;
  mean_happiness?: number;
  n_agents?: number;
  [key: string]: number | undefined;
}

export interface EpisodeFrame {
  tick: number;
  agents: EpisodeAgent[];
  buildings?: EpisodeBuilding[];
  metrics?: EpisodeMetrics;
  agents_alive?: number;
  agents_dead?: number;
}

export interface CityEpisode {
  schemaVersion: number;
  meta: EpisodeMeta;
  buildings: EpisodeBuilding[];
  frames: EpisodeFrame[];
}

export const DEFAULT_EPISODE_URL =
  "/projects/artificial-city/episodes/demo.json";

export function resolveBuildingsAt(
  episode: CityEpisode,
  frameIndex: number
): EpisodeBuilding[] {
  let buildings = episode.buildings;
  for (let i = 0; i <= frameIndex; i++) {
    const patch = episode.frames[i]?.buildings;
    if (patch) buildings = patch;
  }
  return buildings;
}

/** Snapshot compatibile con `CityScene.applySnapshot` (stesso schema live WS). */
export function frameToSnapshot(
  episode: CityEpisode,
  frameIndex: number,
  extras?: { paused?: boolean; speed?: number; policy_name?: string }
) {
  const frame = episode.frames[frameIndex] ?? episode.frames[0];
  return {
    tick: frame.tick,
    grid_size: episode.meta.grid_size,
    day_length: episode.meta.day_length,
    agents: frame.agents,
    buildings: resolveBuildingsAt(episode, frameIndex),
    metrics: frame.metrics ?? {},
    agents_alive: frame.agents_alive ?? frame.agents.length,
    agents_dead: frame.agents_dead ?? 0,
    agents_initial: episode.meta.agents_initial,
    paused: extras?.paused ?? false,
    speed: extras?.speed ?? 1,
    policy_name: extras?.policy_name ?? episode.meta.policy ?? "replay",
    finished: frameIndex >= episode.frames.length - 1 && (extras?.paused ?? false),
  };
}
