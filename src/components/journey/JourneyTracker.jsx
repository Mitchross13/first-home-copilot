import { useState, useEffect } from "react";
import { STAGES } from "../../data/journey.js";
import StageCelebration from "./StageCelebration.jsx";

const STORAGE_KEY = "fhc_journey";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Stage pill in the top pipeline ───────────────────────────────────────────
function StagePip({ stage, index, currentStage, completedStages, onClick }) {
  const isActive = index === currentStage;
  const isDone = completedStages.includes(index);

  return (
    <button
      onClick={() => onClick(index)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        background: "none", border: "none", cursor: "pointer", padding: "0 2px",
        flex: 1, minWidth: 0,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%", fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        background: isDone ? "#0f6e56" : isActive ? "#1a1a1a" : "#f0efe9",
        border: isActive ? "2px solid #1a1a1a" : "2px solid transparent",
        transition: "all 0.2s",
      }}>
        {isDone ? "✓" : stage.emoji}
      </div>
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 400,
        color: isActive ? "#1a1a1a" : isDone ? "#0f6e56" : "#aaa",
        textAlign: "center", lineHeight: 1.2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%",
      }}>
        {stage.label}
      </span>
    </button>
  );
}

// ─── Single checklist task ─────────────────────────────────────────────────────
function Task({ task, checked, onToggle }) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
      borderBottom: "1px solid #f5f4ef", cursor: "pointer",
    }}>
      <div
        onClick={onToggle}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
          border: checked ? "none" : "2px solid #d0cfc9",
          background: checked ? "#0f6e56" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 12, fontWeight: 700, transition: "all 0.15s",
        }}
      >
        {checked ? "✓" : ""}
      </div>
      <span style={{
        fontSize: 14, color: checked ? "#aaa" : "#333",
        textDecoration: checked ? "line-through" : "none",
        lineHeight: 1.5,
      }}>
        {task.text}
      </span>
    </label>
  );
}

// ─── Warning card ──────────────────────────────────────────────────────────────
function Warning({ text }) {
  return (
    <div style={{
      display: "flex", gap: 10, padding: "10px 14px",
      background: "#fff8ed", border: "1px solid #f0e4cc", borderRadius: 10, marginBottom: 8,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <span style={{ fontSize: 13, color: "#6b4a1a", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function JourneyTracker({ userState, userName }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [checked, setChecked] = useState({});
  const [showEducation, setShowEducation] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const firstName = userName ? userName.split(" ")[0] : null;

  // Load persisted progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved.checked) setChecked(saved.checked);
    if (saved.currentStage !== undefined) setCurrentStage(saved.currentStage);
  }, []);

  // Persist on change
  useEffect(() => {
    saveProgress({ checked, currentStage });
  }, [checked, currentStage]);

  const stage = STAGES[currentStage];

  const stageTasks = stage.tasks;
  const checkedCount = stageTasks.filter(t => checked[t.id]).length;
  const pct = Math.round((checkedCount / stageTasks.length) * 100);
  const allDone = checkedCount === stageTasks.length;

  // Which stages are fully complete
  const completedStages = STAGES.map((s, i) =>
    s.tasks.every(t => checked[t.id]) ? i : null
  ).filter(i => i !== null);

  function toggleTask(id) {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // Check if this completes the stage
      const nowDone = stage.tasks.every(t => (t.id === id ? !prev[id] : next[t.id]));
      if (nowDone && !prev[id]) {
        setTimeout(() => setCelebrating(true), 400);
      }
      return next;
    });
  }

  function handleNextStage() {
    setCelebrating(false);
    setShowEducation(false);
    setCurrentStage(i => i + 1);
  }

  const stateNote = stage.stateNotes?.[userState];

  if (celebrating) {
    return (
      <StageCelebration
        stageId={stage.id}
        hasNext={currentStage < STAGES.length - 1}
        onNext={handleNextStage}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>
          {firstName ? `${firstName}'s Buying Journey` : "Your Buying Journey"}
        </h2>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          {completedStages.length === 0
            ? "Let's get you started. Tap a task to mark it done."
            : `${completedStages.length} of ${STAGES.length} stages complete — you're making progress.`}
        </p>
      </div>

      {/* Stage pipeline */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 24, padding: "16px",
        background: "#fafaf7", borderRadius: 14, border: "1.5px solid #e8e7e2",
        overflowX: "auto",
      }}>
        {STAGES.map((s, i) => (
          <StagePip
            key={s.id}
            stage={s}
            index={i}
            currentStage={currentStage}
            completedStages={completedStages}
            onClick={setCurrentStage}
          />
        ))}
      </div>

      {/* Active stage card */}
      <div style={{
        background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14,
        padding: "20px", marginBottom: 16,
      }}>
        {/* Stage header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>{stage.emoji}</span>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#1a1a1a" }}>
              Stage {currentStage + 1}: {stage.label}
            </h3>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{stage.tagline}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, background: "#f0efe9", borderRadius: 3, margin: "14px 0",
        }}>
          <div style={{
            height: "100%", borderRadius: 3,
            width: `${pct}%`,
            background: allDone ? "#0f6e56" : "#1a1a1a",
            transition: "width 0.3s ease",
          }} />
        </div>
        <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px" }}>
          {checkedCount}/{stageTasks.length} tasks complete
        </p>

        {/* Checklist */}
        <div>
          {stageTasks.map(task => (
            <Task
              key={task.id}
              task={task}
              checked={!!checked[task.id]}
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </div>

      </div>

      {/* Warnings */}
      {stage.warnings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#85500b", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Common mistakes at this stage
          </p>
          {stage.warnings.map((w, i) => <Warning key={i} text={w} />)}
        </div>
      )}

      {/* State-specific note */}
      {stateNote && (
        <div style={{
          display: "flex", gap: 10, padding: "10px 14px", marginBottom: 16,
          background: "#eef4ff", border: "1px solid #c8d9f5", borderRadius: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
          <span style={{ fontSize: 13, color: "#2a4a80", lineHeight: 1.5 }}>
            <strong>{userState}:</strong> {stateNote}
          </span>
        </div>
      )}

      {/* Education blurb */}
      <div style={{
        background: "#f5f4ef", borderRadius: 12, overflow: "hidden", marginBottom: 8,
      }}>
        <button
          onClick={() => setShowEducation(e => !e)}
          style={{
            width: "100%", padding: "12px 16px", background: "none", border: "none",
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
            💡 Why this matters
          </span>
          <span style={{ fontSize: 12, color: "#aaa" }}>{showEducation ? "▲" : "▼"}</span>
        </button>
        {showEducation && (
          <div style={{ padding: "0 16px 14px" }}>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>
              {stage.education}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
