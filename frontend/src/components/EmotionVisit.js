import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { emotionColor } from "@/components/emotionColors";

// Four expanded sections a visitor can read about an emotion. Each maps to
// an optional field on the emotions.json entry.
const SECTIONS = [
  {
    key: "physical",
    title: "How it might feel in the body",
  },
  {
    key: "events",
    title: "What might bring it up",
  },
  {
    key: "thoughts",
    title: "Thoughts that can evoke it",
  },
  {
    key: "urges",
    title: "Urges it may create",
  },
];

export default function EmotionVisit({ emotion, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    // Focus the dialog on mount so keyboard users land inside.
    dialogRef.current?.focus();
  }, []);

  // Resolve the featured bubble's colour — prefer any admin override, fall
  // back to the computed hue/sat/light for its coordinate.
  const customColor = emotion.color;
  const computed = emotionColor(emotion.x, emotion.y);
  const bubbleColor = customColor || computed.color;
  const bubbleGlow = customColor ? `${customColor}8c` : computed.glow;

  // Filter out sections with no content so we never show empty prompts.
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
              className="visit-bubble"
              style={{
                "--bubble-color": bubbleColor,
                "--bubble-glow": bubbleGlow,
              }}
            >
              <div className="visit-bubble-aura" />
              <div className="visit-bubble-core" />
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
