"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_EPISODE_URL,
  frameToSnapshot,
  type CityEpisode,
  type EpisodeAgent,
} from "@/lib/demos/city-episode";
import { parseRlEpisode } from "@/lib/types/rl-episode";
import { useLocale } from "@/lib/i18n/locale-context";
import { CityScene, DEFAULT_DAY_LENGTH } from "./artificial-city/city-scene.js";
import "./artificial-city/artificial-city-demo.css";

const SPEED_LEVELS = [0.25, 0.5, 1, 2, 5, 10];

function dayLabel(phase: number) {
  if (phase < 0.2 || phase >= 0.85) return "Notte";
  if (phase < 0.3) return "Alba";
  if (phase < 0.55) return "Giorno";
  if (phase < 0.7) return "Pomeriggio";
  return "Tramonto";
}

function pct(v: number | undefined) {
  return `${Math.max(0, Math.min(100, Number(v) || 0)).toFixed(0)}%`;
}

export function RlVisualizationDemo() {
  const { tr } = useLocale();
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CityScene | null>(null);
  const frameIndexRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const accumRef = useRef(0);
  const episodeRef = useRef<CityEpisode | null>(null);

  const [episode, setEpisode] = useState<CityEpisode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [selected, setSelected] = useState<EpisodeAgent | null>(null);

  const speed = SPEED_LEVELS[speedIdx] ?? 1;

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    frameIndexRef.current = frameIndex;
  }, [frameIndex]);

  useEffect(() => {
    episodeRef.current = episode;
  }, [episode]);

  useEffect(() => {
    let cancelled = false;
    fetch(DEFAULT_EPISODE_URL)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return parseRlEpisode(await res.json()) as CityEpisode;
      })
      .then((data) => {
        if (!cancelled) {
          setEpisode(data);
          setFrameIndex(0);
          frameIndexRef.current = 0;
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyFrame = useCallback((ep: CityEpisode, index: number, paused: boolean, spd: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const snap = frameToSnapshot(ep, index, {
      paused,
      speed: spd,
      policy_name: ep.meta.policy,
    });
    scene.applySnapshot(snap);
  }, []);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container || !episode) return;

    const scene = new CityScene(container, {
      onSelectAgent: (agent: EpisodeAgent | null) => setSelected(agent),
    });
    sceneRef.current = scene;
    applyFrame(episode, frameIndexRef.current, !playingRef.current, speedRef.current);

    let last = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const ep = episodeRef.current;
      if (ep && playingRef.current && ep.frames.length > 1) {
        // ~12 snapshot/s at 1× (similar to live viewer stride feel)
        accumRef.current += dt * speedRef.current * 12;
        while (accumRef.current >= 1) {
          accumRef.current -= 1;
          const next = (frameIndexRef.current + 1) % ep.frames.length;
          frameIndexRef.current = next;
          setFrameIndex(next);
          applyFrame(ep, next, false, speedRef.current);
        }
      }

      scene.update(dt);
      scene.render();
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [episode, applyFrame]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag && ["INPUT", "TEXTAREA"].includes(tag)) return;
      if (ev.code === "Space") {
        ev.preventDefault();
        setPlaying((p) => !p);
      } else if (ev.key === "+" || ev.key === "=") {
        setSpeedIdx((i) => Math.min(SPEED_LEVELS.length - 1, i + 1));
      } else if (ev.key === "-" || ev.key === "_") {
        setSpeedIdx((i) => Math.max(0, i - 1));
      } else if (ev.key === "r" || ev.key === "R") {
        setFrameIndex(0);
        frameIndexRef.current = 0;
        accumRef.current = 0;
        if (episodeRef.current) {
          applyFrame(episodeRef.current, 0, !playingRef.current, speedRef.current);
        }
      } else if (ev.key === "Escape") {
        sceneRef.current?.selectAgent(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyFrame]);

  if (error) {
    return (
      <div className="ac-demo__error">
        {tr("replayLoadError")} ({error}). Verifica{" "}
        <code className="mx-1 rounded bg-muted px-1">
          public/projects/artificial-city/episodes/demo.json
        </code>
        .
      </div>
    );
  }

  if (!episode) {
    return <div className="ac-demo__loading">{tr("demoLoading")}</div>;
  }

  const frame = episode.frames[frameIndex] ?? episode.frames[0];
  const buildings = frameToSnapshot(episode, frameIndex).buildings;
  const homeList = buildings.filter(
    (b) => String(b.type || "").toLowerCase() === "home"
  );
  const builtList = homeList.filter((b) => Number(b.created_tick || 0) > 0);
  const nTiles = builtList.reduce(
    (acc, b) => acc + Math.max(1, Number(b.size) || 1),
    0
  );
  const monies = frame.agents.map((a) => Number(a.money) || 0);
  const moneyAvg = monies.length
    ? monies.reduce((s, v) => s + v, 0) / monies.length
    : 0;
  const moneyMax = monies.length ? Math.max(...monies) : 0;
  const dayLen = episode.meta.day_length || DEFAULT_DAY_LENGTH;
  const phase = (frame.tick % dayLen) / dayLen;
  const gini = frame.metrics?.gini_coefficient;

  return (
    <div className="ac-demo">
      <div ref={canvasRef} className="ac-demo__canvas" />

      <div className="ac-demo__hud">
        <header>
          <h1>Artificial City</h1>
          <p className="ac-demo__policy">{episode.meta.policy ?? "replay"}</p>
        </header>
        <dl>
          <div>
            <dt>Tick</dt>
            <dd>{frame.tick}</dd>
          </div>
          <div>
            <dt>Frame</dt>
            <dd>
              {frameIndex + 1}/{episode.frames.length}
            </dd>
          </div>
          <div>
            <dt>Agenti</dt>
            <dd>{frame.agents_alive ?? frame.agents.length}</dd>
          </div>
          <div>
            <dt>Morti</dt>
            <dd>{frame.agents_dead ?? 0}</dd>
          </div>
          <div>
            <dt>Case</dt>
            <dd>{homeList.length}</dd>
          </div>
          <div>
            <dt>Costruite</dt>
            <dd>
              {builtList.length > 0 ? `${builtList.length} (${nTiles} celle)` : "0"}
            </dd>
          </div>
          <div>
            <dt>€ medio</dt>
            <dd>{moneyAvg.toFixed(0)}</dd>
          </div>
          <div>
            <dt>€ max</dt>
            <dd>{moneyMax.toFixed(0)}</dd>
          </div>
          {gini != null ? (
            <div>
              <dt>Gini</dt>
              <dd>{gini.toFixed(3)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Velocità</dt>
            <dd>{speed.toFixed(2)}×</dd>
          </div>
          <div>
            <dt>Ciclo</dt>
            <dd>{dayLabel(phase)}</dd>
          </div>
          <div>
            <dt>Stato</dt>
            <dd
              className={
                playing ? "ac-demo__status--replay" : "ac-demo__status--paused"
              }
            >
              {playing ? "replay" : "in pausa"}
            </dd>
          </div>
        </dl>
        <div className="ac-demo__controls">
          <button type="button" onClick={() => setPlaying((p) => !p)} title="Spazio">
            {playing ? tr("demoPause") : tr("demoPlay")}
          </button>
          <button
            type="button"
            title="-"
            onClick={() => setSpeedIdx((i) => Math.max(0, i - 1))}
          >
            −
          </button>
          <button
            type="button"
            title="+"
            onClick={() =>
              setSpeedIdx((i) => Math.min(SPEED_LEVELS.length - 1, i + 1))
            }
          >
            +
          </button>
          <button
            type="button"
            title="R"
            onClick={() => {
              setFrameIndex(0);
              frameIndexRef.current = 0;
              accumRef.current = 0;
              applyFrame(episode, 0, !playing, speed);
            }}
          >
            Reset
          </button>
        </div>
        <ul className="ac-demo__legend">
          <li>
            <span className="ac-demo__swatch ac-demo__swatch--home" /> Casa
          </li>
          <li>
            <span className="ac-demo__swatch ac-demo__swatch--home-owned" /> Casa
            privata
          </li>
          <li>
            <span className="ac-demo__swatch ac-demo__swatch--work" /> Lavoro
          </li>
          <li>
            <span className="ac-demo__swatch ac-demo__swatch--shop" /> Supermarket
          </li>
          <li>
            <span className="ac-demo__swatch ac-demo__swatch--lit" /> Occupato
          </li>
        </ul>
        <p className="ac-demo__hint">
          Click agente = dettagli · Drag orbita · Scroll zoom · Esc deseleziona ·
          Spazio pausa
        </p>
      </div>

      {selected ? (
        <aside className="ac-demo__agent">
          <div className="ac-demo__agent-head">
            <h2>{selected.name || `Agente #${selected.id}`}</h2>
            <button
              type="button"
              className="ac-demo__clear"
              title="Esc"
              onClick={() => sceneRef.current?.selectAgent(null)}
            >
              ×
            </button>
          </div>
          <dl>
            <div>
              <dt>Azione</dt>
              <dd>{selected.action || "—"}</dd>
            </div>
            <div>
              <dt>Attività</dt>
              <dd>{selected.activity || "—"}</dd>
            </div>
            <div>
              <dt>Denaro</dt>
              <dd>{Number(selected.money || 0).toFixed(1)}</dd>
            </div>
          </dl>
          <div className="ac-demo__meters">
            <label>
              Fame <span>{pct(selected.hunger)}</span>
            </label>
            <div className="ac-demo__bar ac-demo__bar--hunger">
              <i style={{ width: pct(selected.hunger) }} />
            </div>
            <label>
              Energia <span>{pct(selected.energy)}</span>
            </label>
            <div className="ac-demo__bar ac-demo__bar--energy">
              <i style={{ width: pct(selected.energy) }} />
            </div>
            <label>
              Felicità <span>{pct(selected.happiness)}</span>
            </label>
            <div className="ac-demo__bar ac-demo__bar--happy">
              <i style={{ width: pct(selected.happiness) }} />
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
