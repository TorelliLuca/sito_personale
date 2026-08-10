export const demoSlugs = ["rl-visualization"] as const;

export type DemoSlug = (typeof demoSlugs)[number];

export function getAvailableDemoSlugs(): DemoSlug[] {
  return [...demoSlugs];
}
