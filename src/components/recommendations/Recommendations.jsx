import { useState, useEffect } from "react";
import { LENDERS, INDUSTRY_SCHEMES, LAST_UPDATED } from "../../data/lenders.js";

const VAULT_KEY = "fhc_vault";
const WELCOME_STATE_KEY = "fhc_state";

function loadVault() {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY)) || {}; } catch { return {}; }
}

function fmt(n) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);
}

const OCCUPATION_OPTIONS = [
  { id: "none",         label: "General / other" },
  { id: "nurse",        label: "Nurse / midwife" },
  { id: "doctor",       label: "Doctor / specialist" },
  { id: "allied_health",label: "Allied health (physio, OT, etc.)" },
  { id: "pharmacist",   label: "Pharmacist / dentist" },
  { id: "teacher",      label: "Teacher / education" },
  { id: "defence_force",label: "Defence force (ADF)" },
  { id: "police",       label: "Police / emergency services" },
];

function LenderCard({ lender, score, reasons, isTop }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "#fff",
      border: isTop ? "2px solid #0f6e56" : "1.5px solid #e8e7e2",
      borderRadius: 14, padding: "16px 18px", marginBottom: 12,
      position: "relative",
    }}>
      {isTop && (
        <div style={{
          position: "absolute", top: -10, left: 16,
          background: "#0f6e56", color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "2px 10px", borderRadius: 10, letterSpacing: 0.5,
        }}>
          TOP PICK FOR YOU
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 24 }}>{lender.logo}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{lender.name}</div>
            <div style={{ fontSize: 11, color: "#aaa", textTransform: "capitalize" }}>{lender.type === "big4" ? "Big 4 bank" : "Challenger bank"}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: "#1a1a1a" }}>{lender.variable}%</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>variable p.a.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "12px 0 8px" }}>
        {reasons.map((r, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px",
            background: "#e8f5ee", color: "#0a5a42", borderRadius: 10,
          }}>{r}</span>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, margin: "0 0 10px" }}>{lender.notes}</p>

      <button
        onClick={() => setExpanded(e => !e)}
        style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        {expanded ? "▲ Less detail" : "▼ More detail"}
      </button>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0efe9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#888" }}>1yr fixed rate</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>
              {lender.fixed1yr ? `${lender.fixed1yr}%` : "N/A"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#888" }}>Min. deposit</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{lender.minDeposit}%</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {lender.features.map((f, i) => (
              <span key={i} style={{ fontSize: 11, padding: "3px 8px", background: "#f5f4ef", borderRadius: 8, color: "#555" }}>{f}</span>
            ))}
          </div>
          <a
            href={lender.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", padding: "10px",
              background: "#1a1a1a", color: "#fff", borderRadius: 10,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            Visit {lender.name} →
          </a>
        </div>
      )}
    </div>
  );
}

function SchemeCard({ scheme }) {
  return (
    <div style={{
      background: "#fff8ed", border: "1.5px solid #f0e4cc", borderRadius: 12,
      padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#85500b", marginBottom: 4 }}>{scheme.name}</div>
      <div style={{ fontSize: 12, color: "#6b4a1a", marginBottom: 6, fontWeight: 600 }}>{scheme.benefit}</div>
      <p style={{ fontSize: 12, color: "#7a5520", lineHeight: 1.5, margin: 0 }}>{scheme.details}</p>
      {scheme.url && (
        <a href={scheme.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: "#85500b", marginTop: 8, display: "inline-block", fontWeight: 600 }}>
          Learn more →
        </a>
      )}
    </div>
  );
}

export default function Recommendations({ userName }) {
  const firstName = userName ? userName.split(" ")[0] : null;
  const [occupation, setOccupation] = useState("none");
  const [wantsBranch, setWantsBranch] = useState(false);
  const [prioritisesRate, setPrioritisesRate] = useState(true);
  const vault = loadVault();
  const state = localStorage.getItem(WELCOME_STATE_KEY) || "QLD";

  const income = Object.values(vault.income || {}).reduce((a, v) => a + (Number(v) || 0), 0);
  const savings = Number(vault.assets?.savings || 0);
  const hecs = Number(vault.liabilities?.hecs || 0);
  const creditCards = Number(vault.liabilities?.creditcard || 0);

  // Score lenders based on user profile
  function scoreLender(lender) {
    let score = 50;
    const reasons = [];

    // Rate preference
    if (prioritisesRate) {
      if (lender.variable < 6.1) { score += 20; reasons.push("Low variable rate"); }
      else if (lender.variable < 6.3) { score += 10; }
    }

    // Branch preference
    if (wantsBranch && lender.type === "big4") { score += 15; reasons.push("Branch access"); }
    if (wantsBranch && lender.type !== "big4") { score -= 10; }

    // Help to Buy — VIC, QLD, NSW, SA, ACT, NT only at launch
    const helpToBuyStates = ["VIC", "QLD", "NSW", "SA", "ACT", "NT"];
    if (lender.bestFor.includes("help_to_buy") && helpToBuyStates.includes(state)) {
      score += 25; reasons.push("Help to Buy approved");
    }

    // FHLDS
    if (lender.bestFor.includes("fhlds")) { score += 10; reasons.push("5% Deposit Scheme"); }

    // Occupation-specific
    if (occupation === "nurse" || occupation === "allied_health" || occupation === "doctor" || occupation === "pharmacist") {
      if (lender.specialSchemes?.includes("health_worker")) { score += 30; reasons.push("Health worker rates"); }
    }
    if (occupation === "defence_force") {
      if (lender.specialSchemes?.includes("defence")) { score += 30; reasons.push("Defence discounts"); }
    }
    if (occupation === "police") {
      if (lender.specialSchemes?.includes("police")) { score += 20; reasons.push("Emergency services rates"); }
    }

    // Offset account value (if income > 60k, offset is valuable)
    if (income > 60000 && lender.bestFor.includes("offset")) {
      score += 12; reasons.push("Offset account");
    }

    // No fees
    if (lender.bestFor.includes("low_fees")) { score += 8; reasons.push("No fees"); }

    return { score, reasons: reasons.slice(0, 3) };
  }

  const scored = LENDERS
    .map(l => ({ lender: l, ...scoreLender(l) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // Relevant industry schemes
  const relevantSchemes = INDUSTRY_SCHEMES.filter(s =>
    s.eligible.includes(occupation) ||
    (occupation === "nurse" && s.eligible.includes("allied_health"))
  );

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>
          {firstName ? `${firstName}'s Recommendations` : "Recommendations"}
        </h2>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          Unbiased suggestions based on your situation. We don't take referral fees from lenders.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: "10px 14px", background: "#f5f4ef", borderRadius: 10, marginBottom: 20, border: "1px solid #e8e7e2" }}>
        <p style={{ fontSize: 12, color: "#777", margin: 0, lineHeight: 1.5 }}>
          <strong>Not financial advice.</strong> Rates change daily — always verify before applying. This is a starting point for your research, not a substitute for professional advice. We earn nothing from these recommendations.
        </p>
      </div>

      {/* Preferences */}
      <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Tell us a bit more</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Your occupation</label>
          <select
            value={occupation}
            onChange={e => setOccupation(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", fontSize: 14,
              border: "1.5px solid #e0dfd9", borderRadius: 10, background: "#fafaf7",
              outline: "none", fontFamily: "inherit",
            }}
          >
            {OCCUPATION_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Priority</label>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPrioritisesRate(true)} style={{
                flex: 1, padding: "8px", fontSize: 12, fontWeight: 600,
                border: "none", borderRadius: 8, cursor: "pointer",
                background: prioritisesRate ? "#1a1a1a" : "#f5f4ef",
                color: prioritisesRate ? "#fff" : "#555",
              }}>Lowest rate</button>
              <button onClick={() => setPrioritisesRate(false)} style={{
                flex: 1, padding: "8px", fontSize: 12, fontWeight: 600,
                border: "none", borderRadius: 8, cursor: "pointer",
                background: !prioritisesRate ? "#1a1a1a" : "#f5f4ef",
                color: !prioritisesRate ? "#fff" : "#555",
              }}>Features</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Branch access?</label>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setWantsBranch(true)} style={{
                flex: 1, padding: "8px", fontSize: 12, fontWeight: 600,
                border: "none", borderRadius: 8, cursor: "pointer",
                background: wantsBranch ? "#1a1a1a" : "#f5f4ef",
                color: wantsBranch ? "#fff" : "#555",
              }}>Yes</button>
              <button onClick={() => setWantsBranch(false)} style={{
                flex: 1, padding: "8px", fontSize: 12, fontWeight: 600,
                border: "none", borderRadius: 8, cursor: "pointer",
                background: !wantsBranch ? "#1a1a1a" : "#f5f4ef",
                color: !wantsBranch ? "#fff" : "#555",
              }}>No</button>
            </div>
          </div>
        </div>
      </div>

      {/* Industry schemes */}
      {relevantSchemes.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: "#85500b" }}>
            🎯 Schemes specific to your occupation
          </h3>
          {relevantSchemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
        </div>
      )}

      {/* Lender picks */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Lenders worth looking at</h3>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 14px" }}>Ranked by fit for your situation</p>
        {scored.map((item, i) => (
          <LenderCard
            key={item.lender.id}
            lender={item.lender}
            score={item.score}
            reasons={item.reasons}
            isTop={i === 0}
          />
        ))}
      </div>

      {/* Broker honesty section */}
      <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Should you use a mortgage broker?</h3>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 10 }}>
          Brokers can access dozens of lenders and save you hours of research — but they're paid by lenders, not by you. Their incentive is to close, not necessarily to find the absolute best deal.
        </p>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
          <strong>If you use one:</strong> ask them to show you the commission they receive on each product they recommend. Any broker worth trusting will show you without hesitation.
        </p>
        <div style={{ background: "#f5f4ef", borderRadius: 10, padding: "12px 14px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>Find an independent broker</p>
          <p style={{ fontSize: 12, color: "#777", margin: "0 0 8px", lineHeight: 1.5 }}>
            Search for brokers accredited with MFAA or FBAA who work on a fee-for-service basis rather than pure commission.
          </p>
          <a
            href="https://www.mfaa.com.au/find-a-broker"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, fontWeight: 700, color: "#0f6e56" }}
          >
            MFAA Find a Broker →
          </a>
        </div>
      </div>

      <p style={{ fontSize: 10, color: "#ccc", textAlign: "center", marginTop: 16 }}>
        Rate data last updated: {LAST_UPDATED}. Rates change frequently — verify before applying.
      </p>
    </div>
  );
}
