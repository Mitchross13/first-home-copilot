import { useState } from "react";

const STATES = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "NT", "ACT"];

const STATE_FACTS = {
  QLD: "Queensland's $30k First Home Owner Grant is one of the most generous in the country.",
  NSW: "NSW first home buyers can get full stamp duty exemption on homes under $800k.",
  VIC: "Victoria waives stamp duty entirely for first home buyers on homes under $600k.",
  SA: "South Australia has no stamp duty for first home buyers on new builds.",
  WA: "WA offers a $10k grant plus full stamp duty exemption on homes under $430k.",
  TAS: "Tasmania offers a 50% stamp duty concession for first home buyers.",
  NT: "The NT has the most generous FHB stamp duty concession — full exemption under $650k.",
  ACT: "The ACT offers full stamp duty exemption for first home buyers under $1 million.",
};

export default function WelcomeScreen({ onComplete }) {
  const [phase, setPhase] = useState("hero"); // hero | name | state | ready
  const [name, setName] = useState("");
  const [state, setState] = useState(null);

  function handleNameSubmit(e) {
    e.preventDefault();
    if (name.trim().length < 1) return;
    setPhase("state");
  }

  function handleStateSelect(s) {
    setState(s);
    setPhase("ready");
  }

  function handleLaunch() {
    onComplete({ name: name.trim(), state });
  }

  // ── Hero phase ──────────────────────────────────────────────────────────────
  if (phase === "hero") {
    return (
      <div style={styles.screen}>
        <div style={styles.badge}>✈️ Your co-pilot for the biggest purchase of your life</div>

        <h1 style={styles.heroTitle}>
          Buying your first home<br />
          <span style={{ color: "#0f6e56" }}>shouldn't feel like this.</span>
        </h1>

        <p style={styles.heroSub}>
          Confusing jargon. Hidden costs. Professionals with competing interests.
          Nobody handing you a map.
        </p>

        <div style={styles.painList}>
          {[
            ["😰", "\"What even is LMI and why am I paying it?\""],
            ["😵", "\"My broker mentioned a conveyancer — I found out I needed one two weeks ago.\""],
            ["😤", "\"I had to send the same payslips to three different people.\""],
            ["🤯", "\"I didn't know about the 5% Deposit Scheme until after I'd already bought.\""],
          ].map(([emoji, quote]) => (
            <div key={quote} style={styles.painItem}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span style={styles.painText}>{quote}</span>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, marginBottom: 28, textAlign: "center" }}>
          First Home Co-Pilot gives you a clear map, the real numbers,
          and a step-by-step guide — so you never feel blindsided.
        </p>

        <button onClick={() => setPhase("name")} style={styles.primaryBtn}>
          Let's get started →
        </button>

        <p style={styles.disclaimer}>Free. No account needed. Your data stays on your device.</p>
      </div>
    );
  }

  // ── Name phase ──────────────────────────────────────────────────────────────
  if (phase === "name") {
    return (
      <div style={styles.screen}>
        <div style={styles.stepBadge}>Step 1 of 2</div>
        <h2 style={styles.stepTitle}>First, what should we call you?</h2>
        <p style={styles.stepSub}>We'll use this to personalise your experience.</p>

        <form onSubmit={handleNameSubmit} style={{ width: "100%" }}>
          <input
            autoFocus
            type="text"
            placeholder="Your first name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={styles.input}
          />
          <button
            type="submit"
            disabled={name.trim().length < 1}
            style={{ ...styles.primaryBtn, opacity: name.trim().length < 1 ? 0.4 : 1 }}
          >
            That's me →
          </button>
        </form>
      </div>
    );
  }

  // ── State phase ─────────────────────────────────────────────────────────────
  if (phase === "state") {
    return (
      <div style={styles.screen}>
        <div style={styles.stepBadge}>Step 2 of 2</div>
        <h2 style={styles.stepTitle}>
          Nice to meet you, {name.split(" ")[0]}. 👋<br />
          Which state are you buying in?
        </h2>
        <p style={styles.stepSub}>
          Stamp duty, grants, and rules are all different by state. We need this to give you accurate numbers.
        </p>

        <div style={styles.stateGrid}>
          {STATES.map(s => (
            <button
              key={s}
              onClick={() => handleStateSelect(s)}
              style={{
                ...styles.stateBtn,
                background: state === s ? "#1a1a1a" : "#f5f4ef",
                color: state === s ? "#fff" : "#333",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Ready phase ─────────────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div style={styles.screen}>
        <div style={{ fontSize: 56, marginBottom: 16, textAlign: "center" }}>🛫</div>
        <h2 style={{ ...styles.stepTitle, textAlign: "center" }}>
          You're all set, {name.split(" ")[0]}.
        </h2>
        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, textAlign: "center", marginBottom: 24 }}>
          Here's something worth knowing before we dive in:
        </p>

        <div style={styles.factCard}>
          <div style={styles.factEmoji}>💡</div>
          <p style={styles.factText}>{STATE_FACTS[state]}</p>
        </div>

        <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginBottom: 28, lineHeight: 1.5 }}>
          Most first home buyers don't know this until it's too late.<br />
          We're going to make sure that's not you.
        </p>

        <button onClick={handleLaunch} style={styles.primaryBtn}>
          Show me my roadmap →
        </button>
      </div>
    );
  }

  return null;
}

const styles = {
  screen: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "8px 0 32px", width: "100%",
  },
  badge: {
    fontSize: 12, fontWeight: 600, color: "#0f6e56",
    background: "#e8f5ee", borderRadius: 20, padding: "5px 14px",
    marginBottom: 28, letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 30, fontWeight: 800, lineHeight: 1.25,
    color: "#1a1a1a", margin: "0 0 16px", textAlign: "center", letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15, color: "#666", lineHeight: 1.6,
    textAlign: "center", marginBottom: 28, maxWidth: 380,
  },
  painList: {
    width: "100%", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28,
  },
  painItem: {
    display: "flex", alignItems: "flex-start", gap: 12,
    background: "#fafaf7", border: "1.5px solid #e8e7e2",
    borderRadius: 12, padding: "12px 14px",
  },
  painText: {
    fontSize: 13, color: "#444", fontStyle: "italic", lineHeight: 1.5,
  },
  divider: {
    width: "100%", height: 1, background: "#e8e7e2", margin: "4px 0 24px",
  },
  primaryBtn: {
    width: "100%", padding: "16px", fontSize: 16, fontWeight: 700,
    border: "none", borderRadius: 14, background: "#1a1a1a", color: "#fff",
    cursor: "pointer", transition: "transform 0.1s, opacity 0.2s",
    letterSpacing: -0.2,
  },
  disclaimer: {
    fontSize: 11, color: "#bbb", marginTop: 12, textAlign: "center",
  },
  stepBadge: {
    fontSize: 11, fontWeight: 700, color: "#aaa",
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24, fontWeight: 800, color: "#1a1a1a",
    margin: "0 0 10px", lineHeight: 1.3, letterSpacing: -0.3,
  },
  stepSub: {
    fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 24, textAlign: "center",
  },
  input: {
    width: "100%", padding: "14px 16px", fontSize: 18, fontWeight: 500,
    border: "2px solid #e0dfd9", borderRadius: 12, background: "#fafaf7",
    outline: "none", marginBottom: 14, boxSizing: "border-box",
    fontFamily: "'Instrument Sans', sans-serif",
  },
  stateGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, width: "100%",
  },
  stateBtn: {
    padding: "14px 8px", fontSize: 15, fontWeight: 700,
    border: "2px solid transparent", borderRadius: 12,
    cursor: "pointer", transition: "all 0.15s",
  },
  factCard: {
    display: "flex", gap: 14, padding: "16px 18px", width: "100%",
    background: "#e8f5ee", border: "1.5px solid #b8e0cc", borderRadius: 14,
    marginBottom: 16, boxSizing: "border-box",
  },
  factEmoji: { fontSize: 22, flexShrink: 0 },
  factText: {
    fontSize: 14, color: "#1a4a36", lineHeight: 1.6, margin: 0, fontWeight: 500,
  },
};
