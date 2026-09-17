import { useMemo, useState, useCallback } from "react";
import { Download, ExternalLink, Check } from "lucide-react";
import emotionsData from "@/data/emotions.json";

// Grid bounds — matches the frontend/EmotionGrid config.
const X_MIN = -7;
const X_MAX = 7;
const Y_MIN = -7;
const Y_MAX = 7;

function coordKey(x, y) {
  return `${x},${y}`;
}

const EXTRA_FIELDS = [
  { key: "physical", label: "How it might feel in the body", rows: 2 },
  { key: "events", label: "What might bring it up", rows: 2 },
  { key: "thoughts", label: "Thoughts that can evoke it", rows: 2 },
  { key: "urges", label: "Urges it may create", rows: 2 },
];

// Motion presets available in the Visit overlay. Each animates the featured
// bubble differently so the emotion has its own physical texture.
const MOTION_PRESETS = [
  { key: "still", label: "Still — gentle default" },
  { key: "panic", label: "Panic — prickly, vibrating" },
  { key: "heavy", label: "Heavy — slow bob, weighted" },
  { key: "pulse", label: "Pulse — upbeat rhythmic" },
  { key: "breathe", label: "Breathe — regulated in/out" },
  { key: "radiate", label: "Radiate — rising sparkles" },
  { key: "flicker", label: "Flicker — unstable candle" },
  { key: "sink", label: "Sink — downward drift" },
];

// Build the initial 196-cell working set from the bundled JSON. Any cell
// missing from the file is materialised as a TODO placeholder so the
// editor always shows a full grid.
function buildInitialEntries() {
  const entries = [];
  for (let y = Y_MAX; y >= Y_MIN; y--) {
    if (y === 0) continue;
    for (let x = X_MIN; x <= X_MAX; x++) {
      if (x === 0) continue;
      const key = coordKey(x, y);
      const src = emotionsData[key] || {};
      entries.push({
        x,
        y,
        name: src.name || `TODO (${x},${y})`,
        description: src.description || `TODO: add description for coordinate (${x}, ${y}).`,
        color: src.color || null,
        physical: src.physical || "",
        events: src.events || "",
        thoughts: src.thoughts || "",
        urges: src.urges || "",
        motion: src.motion || "still",
      });
    }
  }
  return entries;
}

// Serialise the working entries back to the on-disk shape.
function entriesToJson(entries) {
  const out = {};
  for (const e of entries) {
    const entry = {
      name: e.name.trim(),
      description: e.description.trim(),
    };
    if (e.color) entry.color = e.color;
    if (e.motion && e.motion !== "still") entry.motion = e.motion;
    for (const f of EXTRA_FIELDS) {
      const v = (e[f.key] || "").trim();
      if (v) entry[f.key] = v;
    }
    out[coordKey(e.x, e.y)] = entry;
  }
  return out;
}

export default function AdminEditor() {
  const [entries, setEntries] = useState(() => buildInitialEntries());
  const [activeColumn, setActiveColumn] = useState(0);
  const [justDownloaded, setJustDownloaded] = useState(false);

  const columns = useMemo(() => {
    const cols = [];
    for (let x = X_MIN; x <= X_MAX; x++) {
      if (x === 0) continue;
      const col = entries.filter((e) => e.x === x).sort((a, b) => b.y - a.y);
      cols.push({ x, entries: col });
    }
    return cols;
  }, [entries]);

  const totals = useMemo(() => {
    const todo = entries.filter((e) => e.name.startsWith("TODO")).length;
    return { done: entries.length - todo, total: entries.length, todo };
  }, [entries]);

  const handleChange = useCallback((x, y, field, value) => {
    setEntries((es) =>
      es.map((e) => (e.x === x && e.y === y ? { ...e, [field]: value } : e)),
    );
  }, []);

  const handleDownload = useCallback(() => {
    const json = JSON.stringify(entriesToJson(entries), null, 2) + "\n";
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emotions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setJustDownloaded(true);
    setTimeout(() => setJustDownloaded(false), 2500);
  }, [entries]);

  return (
    <div className="admin-root" data-testid="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <h1>Atlas — Editor</h1>
          <p>
            {totals.done} / {totals.total} entries written · {totals.todo}{" "}
            placeholders remaining
          </p>
        </div>
        <div className="admin-header-actions">
          <a
            className="admin-view-link"
            href="/"
            data-testid="admin-view-link"
          >
            <ExternalLink size={13} strokeWidth={1.7} />
            Open the atlas
          </a>
          <button
            type="button"
            className={`admin-download-btn${justDownloaded ? " is-done" : ""}`}
            onClick={handleDownload}
            data-testid="admin-download"
          >
            {justDownloaded ? (
              <>
                <Check size={13} strokeWidth={2} />
                Downloaded
              </>
            ) : (
              <>
                <Download size={13} strokeWidth={1.8} />
                Download emotions.json
              </>
            )}
          </button>
        </div>
      </header>

      <div className="admin-hint" data-testid="admin-hint">
        Edits stay in this browser until you download the file. Replace{" "}
        <code>frontend/src/data/emotions.json</code> in your project with the
        downloaded file, then rebuild and redeploy to publish your changes.
      </div>

      <nav className="admin-column-nav" data-testid="admin-column-nav">
        <span className="admin-column-nav-label">Jump to column (x):</span>
        {columns.map((col) => {
          const colTodo = col.entries.filter((e) =>
            e.name.startsWith("TODO"),
          ).length;
          return (
            <button
              key={col.x}
              type="button"
              className={`admin-column-chip${activeColumn === col.x ? " active" : ""}${colTodo === 0 ? " done" : ""}`}
              onClick={() => {
                setActiveColumn(col.x);
                const el = document.getElementById(`col-${col.x}`);
                if (el)
                  el.scrollIntoView({
                    behavior: "smooth",
                    inline: "start",
                    block: "nearest",
                  });
              }}
              data-testid={`admin-column-chip-${col.x}`}
            >
              {col.x >= 0 ? `+${col.x}` : col.x}
              {colTodo > 0 && (
                <span className="admin-column-chip-count">{colTodo}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="admin-columns" data-testid="admin-columns">
        {columns.map((col) => (
          <section
            key={col.x}
            id={`col-${col.x}`}
            className="admin-column"
            data-testid={`admin-column-${col.x}`}
          >
            <header className="admin-column-header">
              <span className="admin-column-x">
                x {col.x >= 0 ? "+" : ""}
                {col.x}
              </span>
              <span className="admin-column-title">
                {col.x < 0 ? "Painful" : "Pleasant"}
              </span>
            </header>
            <div className="admin-column-body">
              {col.entries.map((e) => {
                const key = coordKey(e.x, e.y);
                const isTodo = e.name.startsWith("TODO");
                return (
                  <div
                    key={key}
                    className={`admin-cell${isTodo ? " is-todo" : ""}`}
                    data-testid={`admin-cell-${e.x}-${e.y}`}
                  >
                    <div className="admin-cell-header">
                      <span className="admin-cell-coord">
                        y {e.y >= 0 ? "+" : ""}
                        {e.y}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="admin-name-input"
                      placeholder="Emotion name"
                      value={e.name}
                      onChange={(ev) =>
                        handleChange(e.x, e.y, "name", ev.target.value)
                      }
                      data-testid={`admin-name-${e.x}-${e.y}`}
                    />
                    <textarea
                      className="admin-desc-input"
                      placeholder="One-sentence description…"
                      rows={3}
                      value={e.description}
                      onChange={(ev) =>
                        handleChange(
                          e.x,
                          e.y,
                          "description",
                          ev.target.value,
                        )
                      }
                      data-testid={`admin-desc-${e.x}-${e.y}`}
                    />
                    <div className="admin-color-row">
                      <label
                        className="admin-color-swatch"
                        htmlFor={`color-${e.x}-${e.y}`}
                        style={{
                          background: e.color || "transparent",
                          borderStyle: e.color ? "solid" : "dashed",
                        }}
                        title={e.color ? "Change color" : "Set custom color"}
                      >
                        <input
                          id={`color-${e.x}-${e.y}`}
                          type="color"
                          value={e.color || "#888888"}
                          onChange={(ev) =>
                            handleChange(e.x, e.y, "color", ev.target.value)
                          }
                          data-testid={`admin-color-${e.x}-${e.y}`}
                        />
                      </label>
                      <span className="admin-color-hex">
                        {e.color || "auto (computed)"}
                      </span>
                      {e.color && (
                        <button
                          type="button"
                          className="admin-color-clear"
                          onClick={() =>
                            handleChange(e.x, e.y, "color", "")
                          }
                          data-testid={`admin-color-clear-${e.x}-${e.y}`}
                          title="Reset to computed color"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <label className="admin-motion-row">
                      <span className="admin-motion-label">Motion</span>
                      <select
                        className="admin-motion-select"
                        value={e.motion || "still"}
                        onChange={(ev) =>
                          handleChange(e.x, e.y, "motion", ev.target.value)
                        }
                        data-testid={`admin-motion-${e.x}-${e.y}`}
                      >
                        {MOTION_PRESETS.map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="admin-extra">
                      {EXTRA_FIELDS.map((f) => (
                        <label
                          key={f.key}
                          className="admin-extra-field"
                          data-testid={`admin-extra-${f.key}-${e.x}-${e.y}`}
                        >
                          <span className="admin-extra-label">{f.label}</span>
                          <textarea
                            className="admin-extra-input"
                            rows={f.rows}
                            value={e[f.key]}
                            onChange={(ev) =>
                              handleChange(e.x, e.y, f.key, ev.target.value)
                            }
                            placeholder="Optional"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="admin-footer" data-testid="admin-footer">
        <Download size={13} strokeWidth={1.7} />
        When you&rsquo;re done editing, click <strong>Download emotions.json</strong> and drop it into <code>frontend/src/data/</code> in your project.
      </footer>
    </div>
  );
}
