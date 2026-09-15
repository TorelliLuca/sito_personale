import { z } from "zod";
import {
  DEFAULT_EPISODE_URL,
  type CityEpisode,
} from "@/lib/demos/city-episode";

export { DEFAULT_EPISODE_URL };
const buildingSchema = z
  .object({
    id: z.number(),
    x: z.number(),
    y: z.number(),
    cx: z.number().optional(),
    cy: z.number().optional(),
    type: z.string(),
    occupants: z.number().optional(),
    capacity: z.number().optional(),
    bankrupt: z.boolean().optional(),
    price: z.number().optional(),
    wage: z.number().optional(),
    stock: z.number().optional(),
    goods: z.number().optional(),
    owner_id: z.number().nullable().optional(),
    created_tick: z.number().optional(),
    tiles: z.array(z.array(z.number())).optional(),
    size: z.number().optional(),
  })
  .passthrough();

const agentSchema = z
  .object({
    id: z.number(),
    name: z.string().optional(),
    x: z.number(),
    y: z.number(),
    target_x: z.number().optional(),
    target_y: z.number().optional(),
    hunger: z.number().optional(),
    energy: z.number().optional(),
    money: z.number().optional(),
    happiness: z.number().optional(),
    action: z.string().optional(),
    activity: z.string().nullable().optional(),
    home_id: z.number().optional(),
    work_id: z.number().optional(),
  })
  .passthrough();

export const cityEpisodeSchema = z.object({
  schemaVersion: z.literal(1),
  meta: z
    .object({
      grid_size: z.number().int().positive(),
      day_length: z.number().int().positive(),
      seed: z.number().nullable().optional(),
      policy: z.string().optional(),
      config: z.string().optional(),
      model: z.string().nullable().optional(),
      ticks_simulated: z.number().int().nonnegative().optional(),
      stride: z.number().int().positive().optional(),
      agents_initial: z.number().int().nonnegative().optional(),
      frame_count: z.number().int().positive().optional(),
    })
    .passthrough(),
  buildings: z.array(buildingSchema),
  frames: z
    .array(
      z.object({
        tick: z.number().int().nonnegative(),
        agents: z.array(agentSchema),
        buildings: z.array(buildingSchema).optional(),
        /** Può essere `{}` nei primi frame (metriche non ancora calcolate). */
        metrics: z.record(z.string(), z.number()).optional().default({}),
        agents_alive: z.number().optional(),
        agents_dead: z.number().optional(),
      })
    )
    .min(1),
});

export type RlEpisode = CityEpisode;

export function parseRlEpisode(data: unknown): CityEpisode {
  return cityEpisodeSchema.parse(data) as CityEpisode;
}
