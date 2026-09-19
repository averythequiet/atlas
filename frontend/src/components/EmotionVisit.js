import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { emotionColor } from "@/components/emotionColors";

const SECTIONS = [
  { key: "physical", title: "How it might feel in the body" },
  { key: "events",   title: "What might bring it up" },
  { key: "thoughts", title: "Thoughts that can evoke it" },
  { key: "urges",    title: "Urges it may create" },
];

// Utility: uniform random in [a, b).
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));

// Per-motion particle profile. Each profile owns:
//   count: [min, max]         — how many particles this preset spawns
//   size:  [min, max]         — particle diameter in px
//   dur:   [min, max]         — animation duration in seconds
//   delayRange                — max stagger delay in seconds
//   pick(i, total) -> { sx, sy, ex, ey } — chooses each particle's start
//     and end offset in px relative to the bubble centre. Different presets
//     use very different spatial distributions so no two motions read alike.
const MOTION_PROFILES = {
  still: {
    count: [4, 7],
    size: [5, 11],
    dur: [4.5, 7.5],
    delayRange: 5,
    pick: () => {
      // Ambient orbs floating in a wide random ring around the bubble; drift
      // just a little from their start point.
      const angle = rand(0, Math.PI * 2);
      const r = rand(80, 130);
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r;
      return {
        sx, sy,
        ex: sx + rand(-14, 14),
        ey: sy + rand(-14, 14),
      };
    },
  },
  panic: {
    count: [6, 8],
    size: [3, 6],
    dur: [0.4, 0.7],
    delayRange: 0.6,
    pick: () => {
      // Sharp darts flying outward from the bubble in erratic directions.
      const angle = rand(0, Math.PI * 2);
      const r = rand(110, 170);
      return {
        sx: rand(-6, 6),
        sy: rand(-6, 6),
        ex: Math.cos(angle) * r,
        ey: Math.sin(angle) * r,
      };
    },
  },
  heavy: {
    count: [3, 5],
    size: [7, 13],
    dur: [2.4, 4],
    delayRange: 3,
    pick: () => {
      // Weighted drops released from around the bubble, falling below it.
      const startAngle = rand(-Math.PI, 0); // upper hemisphere start
      const r = rand(45, 75);
      return {
        sx: Math.cos(startAngle) * r,
        sy: Math.sin(startAngle) * r,
        ex: rand(-40, 40),
        ey: rand(100, 160),
      };
    },
  },
  pulse: {
    count: [5, 8],
    size: [4, 9],
    dur: [1, 1.7],
    delayRange: 1.5,
    pick: () => {
      // Sparks pinging radially outward on the beat.
      const angle = rand(0, Math.PI * 2);
      const r = rand(110, 160);
      return {
        sx: rand(-8, 8),
        sy: rand(-8, 8),
        ex: Math.cos(angle) * r,
        ey: Math.sin(angle) * r,
      };
    },
  },
  breathe: {
    count: [3, 5],
    size: [9, 15],
    dur: [5.5, 8],
    delayRange: 6,
    pick: () => {
      // Big soft orbs that gently expand outward on the inhale and pull
      // back in on the exhale.
      const angle = rand(0, Math.PI * 2);
      const rIn = rand(35, 60);
      const rOut = rand(110, 145);
      return {
        sx: Math.cos(angle) * rIn,
        sy: Math.sin(angle) * rIn,
        ex: Math.cos(angle) * rOut,
        ey: Math.sin(angle) * rOut,
      };
    },
  },
  radiate: {
    count: [5, 8],
    size: [5, 10],
    dur: [2.4, 3.6],
    delayRange: 2.8,
    pick: () => {
      // Sparkles rising upward from the bubble like inspiration.
      return {
        sx: rand(-55, 55),
        sy: rand(25, 55),
        ex: rand(-30, 30),
        ey: rand(-170, -110),
      };
    },
  },
  flicker: {
    count: [4, 7],
    size: [3, 6],
    dur: [0.5, 1.1],
    delayRange: 1.6,
    pick: () => {
      // Quick sparks that appear briefly at random spots around the bubble
      // and vanish. Start and end nearby — this preset is about opacity.
      const angle = rand(0, Math.PI * 2);
      const r = rand(70, 120);
      const jx = rand(-10, 10);
      const jy = rand(-10, 10);
      return {
        sx: Math.cos(angle) * r,
        sy: Math.sin(angle) * r,
        ex: Math.cos(angle) * r + jx,
        ey: Math.sin(angle) * r + jy,
      };
    },
  },
  sink: {
    count: [3, 6],
    size: [6, 10],
    dur: [3, 5],
    delayRange: 4,
    pick: () => {
      // Slow teardrops trailing downward beneath the bubble.
      return {
        sx: rand(-50, 50),
        sy: rand(-25, 15),
        ex: rand(-25, 25),
        ey: rand(105, 155),
      };
    },
  },
};

function buildParticles(motionKey, amp, speed) {
  const profile = MOTION_PROFILES[motionKey] || MOTION_PROFILES.still;
  const count = randInt(profile.count[0], profile.count[1]);
  return Array.from({ length: count }, () => {
    const { sx, sy, ex, ey } = profile.pick();
    return {
      size: rand(profile.size[0], profile.size[1]),
      // Faster overall at high energy, slower at low energy.
      dur: rand(profile.dur[0], profile.dur[1]) / speed,
      delay: rand(0, profile.delayRange) * -1, // negative → starts mid-cycle
      // Tighter movements at high energy, wider sweeps at low energy.
      sx: sx * amp,
      sy: sy * amp,
      ex: ex * amp,
      ey: ey * amp,
    };
  });
}

// Base core/aura animation durations per preset (seconds). These get scaled
// by the coord-derived `speed` so the same preset feels frantic at high
// energy and almost frozen at low energy.
const PRESET_TIMING = {
  still:   { core: 6.0,  aura: 6.0 },
  panic:   { core: 0.16, aura: 0.7 },
  heavy:   { core: 4.5,  aura: 4.5 },
  pulse:   { core: 0.75, aura: 0.75 },
  breathe: { core: 6.5,  aura: 6.5 },
  radiate: { core: 3.0,  aura: 3.0 },
  flicker: { core: 0.5,  aura: 0.35 },
  sink:    { core: 5.0,  aura: 5.0 },
};

// Turn a coordinate into a tempo + amplitude multiplier. High-energy
// emotions (y > 0) run faster and tighter; low-energy emotions (y < 0)
// slow down and take broader, softer sweeps — like the difference between
// a nervous vibration and a heavy, almost-frozen weight.
function coordMotion(x, y) {
  const energy = y / 7; // -1..1
  const speed = 1 + energy * 0.6;   // y=+7: 1.6x, y=-7: 0.4x
  const amp = 1 - energy * 0.18;    // y=+7: 0.82, y=-7: 1.18
  // Bubble-ring pulse: for high-energy emotions this reads as a fast
  // heartbeat (punchy peak); for low-energy emotions we switch to a slow,
  // gradual breath-like expansion/contraction. Duration scales with the
  // magnitude of energy so extremes are more pronounced.
  const isHighEnergy = y > 0;
  const heartAnim = isHighEnergy ? "visit-heartbeat" : "visit-breath";
  const heartDur = isHighEnergy
    ? 1.0 - energy * 0.5              // y=+7 → 0.5s (~120bpm), y=+1 → 0.93s (~65bpm)
    : 4 + (Math.abs(y) / 7) * 4;      // y=-1 → 4.6s, y=-7 → 8s (very slow breath)
  return { speed, amp, heartAnim, heartDur };
}

export default function EmotionVisit({ emotion, onClose }) {
  const dialogRef = useRef(null);
  const motionKey = emotion.motion || "still";
  const { speed, amp, heartAnim, heartDur } = coordMotion(emotion.x, emotion.y);
  const baseTiming = PRESET_TIMING[motionKey] || PRESET_TIMING.still;
  const coreDur = baseTiming.core / speed;
  const auraDur = baseTiming.aura / speed;

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Generate a fresh, randomised particle set every time this component
  // remounts (i.e. every visit) so the effect feels alive instead of
  // choreographed. `motionKey` in the deps means switching to a different
  // motion preset also re-rolls the particles.
  const particles = useMemo(
    () => buildParticles(motionKey, amp, speed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [motionKey],
  );

  const customColor = emotion.color;
  const computed = emotionColor(emotion.x, emotion.y);
  const bubbleColor = customColor || computed.color;
  const bubbleGlow = customColor ? `${customColor}8c` : computed.glow;

  const filled = SECTIONS.filter((s) => (emotion[s.key] || "").trim().length > 0);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="visit-overlay"
        data-testid="visit-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-emotion-name"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="visit-card glass-panel"
          ref={dialogRef}
          tabIndex={-1}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="visit-close"
            onClick={onClose}
            aria-label="Close visit"
            data-testid="visit-close"
          >
            <X size={16} strokeWidth={1.7} />
          </button>

          <div className="visit-featured" aria-hidden="true">
            <div
              className={`visit-bubble motion-${motionKey}`}
              data-testid={`visit-bubble-motion-${motionKey}`}
              data-particle-count={particles.length}
              style={{
                "--bubble-color": bubbleColor,
                "--bubble-glow": bubbleGlow,
              }}
            >
              <div
                className="visit-bubble-aura"
                style={{ animationDuration: `${auraDur}s` }}
              />
              <div
                className="visit-bubble-heart"
                aria-hidden="true"
                style={{
                  animationName: heartAnim,
                  animationDuration: `${heartDur}s`,
                }}
              />
              <div
                className="visit-bubble-core"
                style={{ animationDuration: `${coreDur}s` }}
              />
              <div className="visit-particles">
                {particles.map((p, i) => (
                  <span
                    key={i}
                    className="visit-particle"
                    style={{
                      "--size": `${p.size}px`,
                      "--sx": `${p.sx}px`,
                      "--sy": `${p.sy}px`,
                      "--ex": `${p.ex}px`,
                      "--ey": `${p.ey}px`,
                      animationDuration: `${p.dur}s`,
                      animationDelay: `${p.delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="visit-body">
            <p className="visit-coord" data-testid="visit-coord">
              ({emotion.x >= 0 ? `+${emotion.x}` : emotion.x},{" "}
              {emotion.y >= 0 ? `+${emotion.y}` : emotion.y})
            </p>
            <h2
              id="visit-emotion-name"
              className="visit-name"
              data-testid="visit-name"
            >
              {emotion.name}
            </h2>
            <p className="visit-desc" data-testid="visit-description">
              {emotion.description}
            </p>

            {filled.length > 0 ? (
              <div className="visit-sections">
                {filled.map((s) => (
                  <section
                    key={s.key}
                    className="visit-section"
                    data-testid={`visit-section-${s.key}`}
                  >
                    <h3 className="visit-section-title">{s.title}</h3>
                    <p className="visit-section-body">{emotion[s.key]}</p>
                  </section>
                ))}
              </div>
            ) : (
              <p className="visit-empty" data-testid="visit-empty">
                More detail is still being written for this feeling.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
