import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site.config";

export const alt = `${siteConfig.name} | Portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(145deg, #0a0a0a 0%, #111827 55%, #0f172a 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#93c5fd",
          }}
        >
          Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#60a5fa",
              maxWidth: 920,
              lineHeight: 1.3,
            }}
          >
            {siteConfig.role.it}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#cbd5e1",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Sviluppo software, IA e robotica
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          luca-torelli.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
