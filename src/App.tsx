/**
 * App Component — User Flow v2 (Part 1)
 * ------------------------------------
 * Author: Marissa Abao
 *
 * Flow implemented:
 * - Landing state (egg) with Hatch button
 * - Hatching transition (short delay)
 * - Alive state: stats decay + age increases over time
 * - Death occurs at max age
 * - Restart returns to egg and resets state
 *
 * Keeps:
 * - Stats (hunger, happiness, energy, cleanliness)
 * - Clamp 0..100
 * - localStorage persistence (v2 key)
 */

import { useEffect, useMemo, useState } from "react";
import "./App.css";

type LifeStage = "egg" | "hatching" | "alive" | "dead";

type PetState = {
  hunger: number;       // 0 = starving, 100 = full
  happiness: number;    // 0 = sad, 100 = delighted
  energy: number;       // 0 = exhausted, 100 = rested
  cleanliness: number;  // 0 = dirty, 100 = sparkling
  lastUpdated: number;  // timestamp (ms)
};

type SavedGame = {
  version: 2;
  stage: LifeStage;
  age: number;
  pet: PetState;
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const STORAGE_KEY = "tamapet:v2";

/** Timing + rules for Part 1 */
const TICK_MS = 5000;       // every 5 seconds: age++ and decay stats
const MAX_AGE = 24;         // dies at this age (tune later)
const HATCH_MS = 1200;      // hatch animation duration (ms)

function freshPet(now: number): PetState {
  return {
    hunger: 70,
    happiness: 60,
    energy: 80,
    cleanliness: 90,
    lastUpdated: now,
  };
}

export default function App() {
  const initialGame = useMemo(() => {
    const now = Date.now();

    // Default: always start at egg with fresh pet stats
    let stage: LifeStage = "egg";
    let age = 0;
    let pet = freshPet(now);

    // Try restore saved game (optional quality-of-life)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedGame;

        if (saved?.version === 2 && saved.pet) {
          stage = saved.stage ?? "egg";
          age = typeof saved.age === "number" ? saved.age : 0;

          const elapsedSec = Math.floor((now - (saved.pet.lastUpdated || now)) / 1000);

          // Only apply decay while alive
          pet =
            stage === "alive"
              ? { ...applyDecay(saved.pet, elapsedSec), lastUpdated: now }
              : { ...saved.pet, lastUpdated: now };
        }
      }
    } catch {
      /* ignore storage/parse errors */
    }

    return { stage, age, pet };
  }, []);

  const [stage, setStage] = useState<LifeStage>(initialGame.stage);
  const [age, setAge] = useState<number>(initialGame.age);
  const [pet, setPet] = useState<PetState>(initialGame.pet);

  // Persist to localStorage (game snapshot)
  useEffect(() => {
    const payload: SavedGame = { version: 2, stage, age, pet };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [stage, age, pet]);

  // Hatch flow (egg -> hatching -> alive)
  useEffect(() => {
    if (stage !== "hatching") return;

    const t = window.setTimeout(() => {
      setStage("alive");
    }, HATCH_MS);

    return () => window.clearTimeout(t);
  }, [stage]);

  // Auto-loop (age + decay) ONLY while alive
  useEffect(() => {
    if (stage !== "alive") return;

    const id = window.setInterval(() => {
      const now = Date.now();

      setAge((a) => a + 1);

      setPet((prev) => {
        const updated = applyDecay(prev, TICK_MS / 1000);
        return { ...updated, lastUpdated: now };
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [stage]);

  // Death check (Part 1: age-based death)
  useEffect(() => {
    if (stage !== "alive") return;
    if (age >= MAX_AGE) setStage("dead");
  }, [stage, age]);

  // ----- Actions (only meaningful while alive) -----

  const hatch = () => {
    if (stage !== "egg") return;

    const now = Date.now();
    setPet(freshPet(now));
    setAge(0);
    setStage("hatching");
  };

  const restart = () => {
    const now = Date.now();
    setStage("egg");
    setAge(0);
    setPet(freshPet(now));
  };

  const feed = () => {
    if (stage !== "alive") return;
    setPet((p) => ({
      ...p,
      hunger: clamp(p.hunger + 15),
      cleanliness: clamp(p.cleanliness - 5),
      lastUpdated: Date.now(),
    }));
  };

  const play = () => {
    if (stage !== "alive") return;
    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 18),
      energy: clamp(p.energy - 10),
      cleanliness: clamp(p.cleanliness - 6),
      hunger: clamp(p.hunger - 6),
      lastUpdated: Date.now(),
    }));
  };

  const nap = () => {
    if (stage !== "alive") return;
    setPet((p) => ({
      ...p,
      energy: clamp(p.energy + 20),
      happiness: clamp(p.happiness + 4),
      hunger: clamp(p.hunger - 5),
      lastUpdated: Date.now(),
    }));
  };

  const clean = () => {
    if (stage !== "alive") return;
    setPet((p) => ({
      ...p,
      cleanliness: clamp(p.cleanliness + 22),
      happiness: clamp(p.happiness + 3),
      lastUpdated: Date.now(),
    }));
  };

  // ----- UI helpers -----

  const petEmoji =
    stage === "egg" ? "🥚" :
    stage === "hatching" ? "🐣" :
    stage === "alive" ? "🐥" :
    "⚰️";

  const stageLabel =
    stage === "egg" ? "Egg" :
    stage === "hatching" ? "Hatching" :
    stage === "alive" ? "Alive" :
    "Dead";

  return (
    <div className="game-container">
      {/* HUD: Left */}
      <div className="hud top-left" aria-live="polite">
        <div>
          <h3>Hunger</h3>
          <Bar label="Hunger" percent={pet.hunger} />
        </div>
        <div>
          <h3>Happiness</h3>
          <Bar label="Happiness" percent={pet.happiness} />
        </div>
      </div>

      {/* HUD: Right */}
      <div className="hud top-right" aria-live="polite">
        <div>
          <h3>Energy</h3>
          <Bar label="Energy" percent={pet.energy} />
        </div>
        <div>
          <h3>Cleanliness</h3>
          <Bar label="Cleanliness" percent={pet.cleanliness} />
        </div>
      </div>

      {/* Pet Viewport (center) */}
      <div className="pet-view" aria-label="Pet viewport">
        <div
          className="pet-placeholder"
          role="img"
          aria-label={`Stage: ${stageLabel}. Age: ${age}.`}
          title={`Stage: ${stageLabel} • Age: ${age}`}
        >
          {petEmoji}
        </div>
      </div>

      {/* Actions (bottom) */}
      <div className="actions-panel" role="group" aria-label="Actions">
        {stage === "egg" && (
          <button className="action-btn feed" onClick={hatch} aria-label="Hatch your pet">
            Hatch
          </button>
        )}

        {stage === "hatching" && (
          <button className="action-btn feed" disabled aria-label="Hatching in progress">
            Hatching…
          </button>
        )}

        {stage === "alive" && (
          <>
            <button className="action-btn feed" onClick={feed} aria-label="Feed your pet">
              Feed
            </button>
            <button className="action-btn play" onClick={play} aria-label="Play with your pet">
              Play
            </button>
            <button className="action-btn nap" onClick={nap} aria-label="Let your pet nap">
              Nap
            </button>
            <button className="action-btn clean" onClick={clean} aria-label="Clean your pet">
              Clean
            </button>
          </>
        )}

        {stage === "dead" && (
          <button className="action-btn clean" onClick={restart} aria-label="Restart the game">
            Restart
          </button>
        )}
      </div>
    </div>
  );
}

function applyDecay(p: PetState, seconds: number): PetState {
  const hungerDecay = -0.25;
  const happinessDecay = -0.30;
  const energyDecay = -0.18;
  const cleanlinessDecay = -0.22;

  return {
    hunger: clamp(p.hunger + hungerDecay * seconds),
    happiness: clamp(p.happiness + happinessDecay * seconds),
    energy: clamp(p.energy + energyDecay * seconds),
    cleanliness: clamp(p.cleanliness + cleanlinessDecay * seconds),
    lastUpdated: p.lastUpdated,
  };
}

function Bar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      className="stat-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <span style={{ width: `${clamp(percent)}%` }} />
    </div>
  );
}