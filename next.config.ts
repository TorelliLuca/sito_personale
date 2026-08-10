import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/rl-visualization",
        destination: "/projects/artificial-city",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
