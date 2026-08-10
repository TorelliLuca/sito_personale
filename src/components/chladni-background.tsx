"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const PARTICLE_COUNT = 2800;
const DT = 0.018;
const DAMPING = 0.9;
const FORCE_SCALE = 0.00065;
const PLATE_INSET = 0.04;

function chladniZ(x: number, y: number, m: number, n: number): number {
  return (
    Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y) -
    Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y)
  );
}

function chladniGradZ2Neg(
  x: number,
  y: number,
  m: number,
  n: number
): [number, number] {
  const z = chladniZ(x, y, m, n);
  const dzdx =
    m * Math.PI * Math.cos(m * Math.PI * x) * Math.sin(n * Math.PI * y) -
    n * Math.PI * Math.cos(n * Math.PI * x) * Math.sin(m * Math.PI * y);
  const dzdy =
    n * Math.PI * Math.sin(m * Math.PI * x) * Math.cos(n * Math.PI * y) -
    m * Math.PI * Math.sin(n * Math.PI * x) * Math.cos(m * Math.PI * y);
  const factor = 2 * z;
  return [-factor * dzdx, -factor * dzdy];
}

function modalIndices(t: number): [number, number] {
  const m = 2 + 1.7 * Math.sin(t * 0.11) + 0.55 * Math.cos(t * 0.063);
  const n = 3 + 1.7 * Math.cos(t * 0.127) + 0.55 * Math.sin(t * 0.089);
  return [m, n];
}

function isDarkTheme(): boolean {
  return document.documentElement.classList.contains("dark");
}

function themeColors(dark: boolean) {
  return dark
    ? {
        fade: "rgba(37, 37, 37, 0.22)",
        particle: "rgba(96, 165, 250, 0.58)",
      }
    : {
        fade: "rgba(250, 250, 252, 0.34)",
        particle: "rgba(37, 99, 235, 0.42)",
      };
}

interface PlateLayout {
  offsetX: number;
  offsetY: number;
  plateWidth: number;
  plateHeight: number;
}

export type ChladniVariant = "hero" | "panel";

function getPlateLayout(
  width: number,
  height: number,
  variant: ChladniVariant
): PlateLayout {
  if (variant === "panel") {
    const size = Math.min(width, height) * 0.88;
    return {
      offsetX: (width - size) * 0.5,
      offsetY: (height - size) * 0.5,
      plateWidth: size,
      plateHeight: size,
    };
  }

  const isNarrow = width < 640;

  if (isNarrow) {
    const plateWidth = width * 0.94;
    const plateHeight = height * 0.52;
    return {
      offsetX: (width - plateWidth) * 0.5,
      offsetY: height * 0.4,
      plateWidth,
      plateHeight,
    };
  }

  const plateHeight = height * 0.9;
  const plateWidth = Math.min(width * 0.56, plateHeight * 1.65);
  return {
    offsetX: width - plateWidth - width * 0.025,
    offsetY: (height - plateHeight) * 0.5,
    plateWidth,
    plateHeight,
  };
}

interface ChladniBackgroundProps {
  variant?: ChladniVariant;
  className?: string;
}

export function ChladniBackground({
  variant = "hero",
  className,
}: ChladniBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const px = new Float32Array(PARTICLE_COUNT);
    const py = new Float32Array(PARTICLE_COUNT);
    const vx = new Float32Array(PARTICLE_COUNT);
    const vy = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      px[i] = PLATE_INSET + Math.random() * (1 - 2 * PLATE_INSET);
      py[i] = PLATE_INSET + Math.random() * (1 - 2 * PLATE_INSET);
    }

    let animationId = 0;
    let layout: PlateLayout = {
      offsetX: 0,
      offsetY: 0,
      plateWidth: 1,
      plateHeight: 1,
    };
    let cssWidth = 0;
    let cssHeight = 0;
    const start = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = parent.clientWidth;
      cssHeight = parent.clientHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = getPlateLayout(cssWidth, cssHeight, variant);
    };

    const stepParticles = (m: number, n: number) => {
      const min = PLATE_INSET;
      const max = 1 - PLATE_INSET;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let x = px[i];
        let y = py[i];

        const [gx, gy] = chladniGradZ2Neg(x, y, m, n);
        vx[i] = (vx[i] + gx * FORCE_SCALE) * DAMPING;
        vy[i] = (vy[i] + gy * FORCE_SCALE) * DAMPING;

        x += vx[i] * DT;
        y += vy[i] * DT;

        if (x < min) {
          x = min;
          vx[i] *= -0.35;
        } else if (x > max) {
          x = max;
          vx[i] *= -0.35;
        }

        if (y < min) {
          y = min;
          vy[i] *= -0.35;
        } else if (y > max) {
          y = max;
          vy[i] *= -0.35;
        }

        px[i] = x;
        py[i] = y;
      }
    };

    const drawParticles = (colors: ReturnType<typeof themeColors>) => {
      ctx.fillStyle = colors.particle;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const screenX = layout.offsetX + px[i] * layout.plateWidth;
        const screenY = layout.offsetY + py[i] * layout.plateHeight;
        ctx.fillRect(screenX, screenY, 1.35, 1.35);
      }
    };

    const drawStatic = () => {
      const [m, n] = modalIndices(0);
      const colors = themeColors(isDarkTheme());

      ctx.fillStyle = colors.fade;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      for (let s = 0; s < 48; s++) {
        stepParticles(m, n);
      }

      drawParticles(colors);
    };

    const animate = (now: number) => {
      const t = (now - start) * 0.001;
      const [m, n] = modalIndices(t);
      const colors = themeColors(isDarkTheme());

      ctx.fillStyle = colors.fade;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      stepParticles(m, n);
      drawParticles(colors);

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      drawStatic();
    } else {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none h-full w-full opacity-90",
        variant === "hero" && "absolute inset-0",
        className
      )}
    />
  );
}
