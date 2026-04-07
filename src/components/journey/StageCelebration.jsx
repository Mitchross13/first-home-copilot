import { useEffect, useState } from "react";

const MESSAGES = {
  saving:      { emoji: "💰", title: "Deposit mindset: locked in.", sub: "You know your numbers. Most people never get this far." },
  preapproval: { emoji: "📋", title: "Pre-approval: done.", sub: "You now know exactly what you can borrow. That's power." },
  searching:   { emoji: "🔍", title: "Search phase: complete.", sub: "You've done the research. When the right one appears, you'll know." },
  offer:       { emoji: "🤝", title: "Offer made.", sub: "Nerve-wracking. But you were prepared. That matters." },
  contract:    { emoji: "📝", title: "Under contract — going unconditional.", sub: "This is the big one. You made it through." },
  settlement:  { emoji: "🏦", title: "Settlement: done.", sub: "Keys in hand. It's yours. That actually just happened." },
  movein:      { emoji: "🏡", title: "You're home.", sub: "First home buyer → homeowner. Welcome to the other side." },
};

export default function StageCelebration({ stageId, onNext, hasNext }) {
  const [visible, setVisible] = useState(false);
  const msg = MESSAGES[stageId] || { emoji: "✅", title: "Stage complete.", sub: "On to the next." };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      textAlign: "center", padding: "32px 20px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.4s ease",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{msg.emoji}</div>
      <h3 style={{
        fontSize: 22, fontWeight: 800, color: "#1a1a1a",
        margin: "0 0 10px", letterSpacing: -0.3,
      }}>
        {msg.title}
      </h3>
      <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6, margin: "0 0 28px" }}>
        {msg.sub}
      </p>

      {hasNext ? (
        <button onClick={onNext} style={{
          width: "100%", padding: "15px", fontSize: 15, fontWeight: 700,
          border: "none", borderRadius: 14, background: "#0f6e56", color: "#fff",
          cursor: "pointer",
        }}>
          Next stage →
        </button>
      ) : (
        <div style={{
          padding: "20px", background: "#e8f5ee", borderRadius: 14,
          border: "1.5px solid #b8e0cc",
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0f6e56", margin: "0 0 6px" }}>
            🎉 Journey complete.
          </p>
          <p style={{ fontSize: 13, color: "#2a6a4a", margin: 0, lineHeight: 1.5 }}>
            You navigated the entire process. Share this app with a friend who's about to start theirs.
          </p>
        </div>
      )}
    </div>
  );
}
