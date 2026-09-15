export type CitySceneAgent = {
  id: number;
  name?: string;
  x: number;
  y: number;
  hunger?: number;
  energy?: number;
  money?: number;
  happiness?: number;
  action?: string;
  activity?: string | null;
  [key: string]: unknown;
};

export declare class CityScene {
  constructor(
    container: HTMLElement,
    opts?: { onSelectAgent?: (agent: CitySceneAgent | null) => void }
  );
  dayLength: number;
  applySnapshot(snapshot: Record<string, unknown>): void;
  update(dt: number): void;
  render(): void;
  selectAgent(id: number | null): void;
  dispose(): void;
  getDayPhase(): number;
  getNightFactor(): number;
}

export declare const DEFAULT_DAY_LENGTH: number;
