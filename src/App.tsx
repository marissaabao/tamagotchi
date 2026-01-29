
/**
 * App Component — Playable Logic v1
 * ---------------------------------
 * Author: Marissa Abao
 *
 * Description:
 * Adds the initial Tamagotchi game logic:
 * - Pet stats (hunger, happiness, energy, cleanliness)
 * - Auto-decay over time (interval-based loop)
 * - Action buttons to modify stats (Feed, Play, Nap, Clean)
 * - Clamping of values between 0 and 100
 * - localStorage persistence across page reloads
 *
 * Notes:
 * - This is a simple, single-screen version to get the game playable.
 * - Decay rates and action values can be tuned for better balance later.
 * - Next steps: animations, sounds, events, accessibility polish.
 */

import { useEffect, useMemo, useState } from "react";
import "./App.css";

type PetState = {
  hunger: number;       // 0 = starving, 100 = full
  happiness: number;    // 0 = sad, 100 = delighted
  energy: number;       // 0 = exhausted, 100 = rested
  cleanliness: number;  // 0 = dirty, 100 = sparkling
  lastUpdated: number;  // timestamp (ms)
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const STORAGE_KEY = "tamapet:v1";

export default function App() {
  const initialState: PetState = useMemo(() => {
    const now = Date.now();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PetState;
        const elapsedSec = Math.floor((now - (saved.lastUpdated || now)) / 1000);
        const decayed = applyDecay(saved, elapsedSec);
        return { ...decayed, lastUpdated: now };
      }
    } catch {
      /* ignore parse errors */
    }
    return {
      hunger: 70,
      happiness: 60,
      energy: 80,
      cleanliness: 90,
      lastUpdated: now,
    };
  }, []);

  const [pet, setPet] = useState<PetState>(initialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
  }, [pet]);

  // Auto-decay loop
  useEffect(() => {
    const TICK_MS = 5000;
    const id = setInterval(() => {
      setPet((prev) => {
        const updated = applyDecay(prev, TICK_MS / 1000);
        return { ...updated, lastUpdated: Date.now() };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Actions
  const feed = () =>
    setPet((p) => ({
      ...p,
      hunger: clamp(p.hunger + 15),
      cleanliness: clamp(p.cleanliness - 5),
      lastUpdated: Date.now(),
    }));

  const play = () =>
    setPet((p) => ({
      ...p,
      happiness: clamp(p.happiness + 18),
      energy: clamp(p.energy - 10),
      cleanliness: clamp(p.cleanliness - 6),
      hunger: clamp(p.hunger - 6),
      lastUpdated: Date.now(),
    }));

  const nap = () =>
    setPet((p) => ({
      ...p,
      energy: clamp(p.energy + 20),
      happiness: clamp(p.happiness + 4),
      hunger: clamp(p.hunger - 5),
      lastUpdated: Date.now(),
    }));

  const clean = () =>
    setPet((p) => ({
      ...p,
      cleanliness: clamp(p.cleanliness + 22),
      happiness: clamp(p.happiness + 3),
      lastUpdated: Date.now(),
    }));

  return (
    <div className="game-container">
      {/* HUD: Left (each stat is a direct child <div> for the mobile grid) */}
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
          aria-label="Your pet is here"
          title="Your pet"
        >
          🐣
        </div>
      </div>

      {/* Actions (bottom) */}
      <div className="actions-panel" role="group" aria-label="Actions">
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
