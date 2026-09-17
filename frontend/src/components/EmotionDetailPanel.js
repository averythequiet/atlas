import { X, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EmotionDetailPanel({ emotion, loading, onClose, onVisit }) {
  const hasEmotion = !!emotion;
  // The Visit button is offered only for coordinates that have a real name,
  // not the "Unnamed" placeholder shown for TODO cells.
  const canVisit =
    hasEmotion &&
    onVisit &&
    emotion.source !== "placeholder" &&
    emotion.name !== "Unnamed";

  return (
    <aside
      className={`glass-panel detail-panel${hasEmotion ? " has-emotion" : " is-empty"}`}
      data-testid="emotion-detail-panel"
    >
      {hasEmotion && (
        <button
          className="detail-close"
          onClick={onClose}
          aria-label="Close emotion detail"
          data-testid="detail-close"
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      )}

      {loading && !emotion ? (
        <div>
          <h2 className="detail-name" style={{ opacity: 0.4 }}>
            <span className="spinner" style={{ marginRight: 10 }} />
            Naming this feeling
          </h2>
          <p className="detail-desc" style={{ opacity: 0.6 }}>
            Consulting the emotion cartographer for a coordinate that
            hasn&rsquo;t been mapped yet.
          </p>
        </div>
      ) : hasEmotion ? (
        <motion.div
          key={`${emotion.x},${emotion.y}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="detail-name" data-testid="detail-name">
            {emotion.name}
          </h2>
          <p className="detail-desc" data-testid="detail-description">
            {emotion.description}
          </p>
          {canVisit && (
            <button
              type="button"
              className="detail-visit-btn"
              onClick={onVisit}
              data-testid="detail-visit"
            >
              Visit this emotion
              <ArrowUpRight size={13} strokeWidth={1.8} />
            </button>
          )}
        </motion.div>
      ) : (
        <div className="detail-empty" data-testid="detail-empty">
          <h2 className="detail-name detail-empty-title">A feeling</h2>
          <p className="detail-desc detail-empty-hint">
            Choose a bubble to read its name and description.
          </p>
        </div>
      )}
    </aside>
  );
}
