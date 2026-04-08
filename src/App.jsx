import { useState, useMemo } from "react";
import JourneyTracker from "./components/journey/JourneyTracker.jsx";
import WelcomeScreen from "./components/welcome/WelcomeScreen.jsx";
import DocumentVault from "./components/vault/DocumentVault.jsx";
import Recommendations from "./components/recommendations/Recommendations.jsx";
import DevEditor from "./components/devtools/DevEditor.jsx";

const STATES = {
  QLD: {
    name: "Queensland",
    fhog: { amount: 30000, newOnly: true, cap: 750000 },
    stampDuty: (v) => {
      if (v <= 350000) return 0;
      if (v <= 540000) return (v - 350000) * 0.035;
      if (v <= 1000000) return 6650 + (v - 540000) * 0.045;
      return 27350 + (v - 1000000) * 0.0575;
    },
    fhbConcession: (v, isNew) => {
      if (v <= 700000) return 1.0;
      if (v <= 800000) return 1.0 - ((v - 700000) / 100000);
      return 0;
    },
    transferFee: (v) => Math.max(198.15, v / 1000 * 3.96 + 198.15),
  },
  NSW: {
    name: "New South Wales",
    fhog: { amount: 10000, newOnly: true, cap: 600000 },
    stampDuty: (v) => {
      if (v <= 350000) return v * 0.0125;
      if (v <= 1093000) return 4375 + (v - 350000) * 0.045;
      return 37810 + (v - 1093000) * 0.055;
    },
    fhbConcession: (v) => {
      if (v <= 800000) return 1.0;
      if (v <= 1000000) return 1.0 - ((v - 800000) / 200000);
      return 0;
    },
    transferFee: () => 165,
  },
  VIC: {
    name: "Victoria",
    fhog: { amount: 10000, newOnly: true, cap: 750000 },
    stampDuty: (v) => {
      if (v <= 25000) return v * 0.014;
      if (v <= 130000) return 350 + (v - 25000) * 0.024;
      if (v <= 960000) return 2870 + (v - 130000) * 0.06;
      return 52670 + (v - 960000) * 0.055;
    },
    fhbConcession: (v) => {
      if (v <= 600000) return 1.0;
      if (v <= 750000) return 1.0 - ((v - 600000) / 150000);
      return 0;
    },
    transferFee: () => 1245,
  },
  SA: {
    name: "South Australia",
    fhog: { amount: 15000, newOnly: true, cap: null },
    stampDuty: (v) => {
      if (v <= 12000) return v * 0.01;
      if (v <= 30000) return 120 + (v - 12000) * 0.02;
      if (v <= 50000) return 480 + (v - 30000) * 0.03;
      if (v <= 100000) return 1080 + (v - 50000) * 0.035;
      if (v <= 200000) return 2830 + (v - 100000) * 0.04;
      if (v <= 250000) return 6830 + (v - 200000) * 0.0425;
      if (v <= 300000) return 8955 + (v - 250000) * 0.0475;
      if (v <= 500000) return 11330 + (v - 300000) * 0.05;
      return 21330 + (v - 500000) * 0.055;
    },
    fhbConcession: (v, isNew) => isNew ? 1.0 : 0,
    transferFee: () => 240,
  },
  WA: {
    name: "Western Australia",
    fhog: { amount: 10000, newOnly: true, cap: 750000 },
    stampDuty: (v) => {
      if (v <= 120000) return v * 0.019;
      if (v <= 150000) return 2280 + (v - 120000) * 0.0285;
      if (v <= 360000) return 3135 + (v - 150000) * 0.038;
      if (v <= 725000) return 11115 + (v - 360000) * 0.0475;
      return 28402 + (v - 725000) * 0.0515;
    },
    fhbConcession: (v) => {
      if (v <= 430000) return 1.0;
      if (v <= 530000) return 1.0 - ((v - 430000) / 100000);
      return 0;
    },
    transferFee: () => 340,
  },
  TAS: {
    name: "Tasmania",
    fhog: { amount: 30000, newOnly: true, cap: null },
    stampDuty: (v) => {
      if (v <= 3000) return v * 0.0175;
      if (v <= 25000) return 50 + (v - 3000) * 0.0225;
      if (v <= 75000) return 545 + (v - 25000) * 0.035;
      if (v <= 200000) return 2295 + (v - 75000) * 0.04;
      if (v <= 375000) return 7295 + (v - 200000) * 0.0425;
      if (v <= 725000) return 14732 + (v - 375000) * 0.045;
      return 30482 + (v - 725000) * 0.045;
    },
    fhbConcession: (v) => v <= 750000 ? 0.5 : 0,
    transferFee: () => 260,
  },
  NT: {
    name: "Northern Territory",
    fhog: { amount: 10000, newOnly: true, cap: 750000 },
    stampDuty: (v) => {
      const r = v / 1000;
      if (v <= 525000) return Math.max(0, (0.06571441 * r * r + 15 * r) * 1.0);
      return v * 0.0495;
    },
    fhbConcession: (v) => v <= 650000 ? 1.0 : 0,
    transferFee: () => 165,
  },
  ACT: {
    name: "ACT",
    fhog: { amount: 7000, newOnly: true, cap: 750000 },
    stampDuty: (v) => {
      if (v <= 260000) return v * 0.006;
      if (v <= 300000) return 1560 + (v - 260000) * 0.023;
      if (v <= 500000) return 2480 + (v - 300000) * 0.039;
      if (v <= 750000) return 10280 + (v - 500000) * 0.041;
      if (v <= 1000000) return 20530 + (v - 750000) * 0.0465;
      if (v <= 1455000) return 32405 + (v - 1000000) * 0.05;
      return 55155 + (v - 1455000) * 0.071;
    },
    fhbConcession: (v) => v <= 1000000 ? 1.0 : 0,
    transferFee: () => 0,
  },
};

const fmt = (n) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
const pct = (n) => `${n.toFixed(1)}%`;

function LMI(propertyValue, deposit) {
  const lvr = ((propertyValue - deposit) / propertyValue) * 100;
  if (lvr <= 80) return 0;
  if (lvr <= 85) return (propertyValue - deposit) * 0.01;
  if (lvr <= 90) return (propertyValue - deposit) * 0.022;
  if (lvr <= 95) return (propertyValue - deposit) * 0.04;
  return (propertyValue - deposit) * 0.06;
}

const Pill = ({ active, children, onClick }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
    background: active ? "#1a1a1a" : "#f0efe9", color: active ? "#fff" : "#555",
    transition: "all 0.2s",
  }}>{children}</button>
);

const InfoTip = ({ label, tip }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 13, color: "#777" }}>{label}</span>
    <span title={tip} style={{ cursor: "help", fontSize: 11, color: "#aaa", border: "1px solid #ddd", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>?</span>
  </div>
);

const CostRow = ({ label, value, highlight, tip, indent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0efe9", marginLeft: indent ? 16 : 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 14, color: indent ? "#999" : "#555" }}>{label}</span>
      {tip && <span title={tip} style={{ cursor: "help", fontSize: 10, color: "#bbb", border: "1px solid #e0e0e0", borderRadius: "50%", width: 14, height: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>?</span>}
    </div>
    <span style={{ fontSize: 14, fontWeight: 500, color: highlight === "green" ? "#0f6e56" : highlight === "red" ? "#a32d2d" : "#1a1a1a", fontFamily: "'DM Mono', monospace" }}>{value}</span>
  </div>
);

const StepIndicator = ({ current, total, labels }) => (
  <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
    {labels.map((l, i) => (
      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          {i > 0 && <div style={{ flex: 1, height: 2, background: i <= current ? "#1a1a1a" : "#e8e7e2" }} />}
          <div style={{
            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, flexShrink: 0,
            background: i <= current ? "#1a1a1a" : "#f5f4ef", color: i <= current ? "#fff" : "#999",
            border: i === current ? "2px solid #1a1a1a" : "2px solid transparent",
          }}>{i + 1}</div>
          {i < labels.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? "#1a1a1a" : "#e8e7e2" }} />}
        </div>
        <span style={{ fontSize: 11, color: i <= current ? "#1a1a1a" : "#aaa", fontWeight: i === current ? 600 : 400, textAlign: "center" }}>{l}</span>
      </div>
    ))}
  </div>
);

export default function App() {
  const [welcomed, setWelcomed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fhc_welcomed")) || false; } catch { return false; }
  });
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem("fhc_name") || ""; } catch { return ""; }
  });
  const [tab, setTab] = useState("calculator");
  const [step, setStep] = useState(0);
  const [state, setState] = useState(() => {
    try { return localStorage.getItem("fhc_state") || "QLD"; } catch { return "QLD"; }
  });
  const [price, setPrice] = useState(650000);
  const [deposit, setDeposit] = useState(65000);
  const [isNew, setIsNew] = useState(false);
  const [income, setIncome] = useState(85000);
  const [hasOwned, setHasOwned] = useState(false);

  const s = STATES[state];
  const lvr = price > 0 ? ((price - deposit) / price) * 100 : 0;
  const loanAmount = price - deposit;

  const calc = useMemo(() => {
    const rawStamp = s.stampDuty(price);
    const concession = s.fhbConcession(price, isNew);
    const stampDuty = Math.round(rawStamp * (1 - concession));
    const stampSaved = Math.round(rawStamp - stampDuty);
    const lmi = Math.round(LMI(price, deposit));
    const fhogEligible = !hasOwned && isNew && (s.fhog.cap === null || price <= s.fhog.cap);
    const fhogAmount = fhogEligible ? s.fhog.amount : 0;
    const fivePercentEligible = !hasOwned && deposit >= price * 0.05;
    const lmiSavedByScheme = fivePercentEligible && lvr > 80 ? lmi : 0;
    const helpToBuyEligible = !hasOwned && income <= 90000;
    const conveyancing = 1800;
    const inspections = 800;
    const insurance = 600;
    const movingCosts = 1500;
    const transferFee = Math.round(s.transferFee(price));
    const totalUpfront = deposit + stampDuty + lmi - lmiSavedByScheme + conveyancing + inspections + insurance + movingCosts + transferFee;
    const totalSavings = fhogAmount + stampSaved + lmiSavedByScheme;
    const netUpfront = totalUpfront - fhogAmount;
    return { rawStamp, stampDuty, stampSaved, concession, lmi, fhogEligible, fhogAmount, fivePercentEligible, lmiSavedByScheme, helpToBuyEligible, conveyancing, inspections, insurance, movingCosts, transferFee, totalUpfront, totalSavings, netUpfront };
  }, [state, price, deposit, isNew, income, hasOwned]);

  function handleWelcomeComplete({ name, state: chosenState }) {
    setUserName(name);
    setState(chosenState);
    setWelcomed(true);
    localStorage.setItem("fhc_name", name);
    localStorage.setItem("fhc_state", chosenState);
    localStorage.setItem("fhc_welcomed", "true");
  }

  const firstName = userName ? userName.split(" ")[0] : null;

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: 16, border: "1.5px solid #e0dfd9",
    borderRadius: 10, background: "#fafaf7", outline: "none", fontFamily: "'DM Mono', monospace",
    transition: "border-color 0.2s",
  };

  if (!welcomed) {
    return (
      <div style={{ fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif", maxWidth: 540, margin: "0 auto", padding: "40px 20px 32px" }}>
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif", maxWidth: 540, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "#0f6e56", textTransform: "uppercase" }}>✈️ Co-Pilot</span>
        {firstName && (
          <button
            onClick={() => { localStorage.removeItem("fhc_welcomed"); setWelcomed(false); }}
            style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer" }}
          >
            Not {firstName}?
          </button>
        )}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a", letterSpacing: -0.5 }}>
        {firstName ? `Hey ${firstName}. 👋` : "First Home Co-Pilot"}
      </h1>
      <p style={{ fontSize: 14, color: "#888", margin: "0 0 20px", lineHeight: 1.5 }}>
        Your roadmap to buying your first home.
      </p>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 3, marginBottom: 24, background: "#f0efe9", borderRadius: 12, padding: 4 }}>
        {[
          { id: "calculator",      label: "💰", title: "Costs" },
          { id: "journey",         label: "🗺️", title: "Journey" },
          { id: "vault",           label: "📁", title: "Finances" },
          { id: "recommendations", label: "⭐", title: "Picks" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "9px 4px", fontSize: 11, fontWeight: 600, border: "none",
              borderRadius: 9, cursor: "pointer", transition: "all 0.2s",
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? "#1a1a1a" : "#888",
              boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}
          >
            <span style={{ fontSize: 18 }}>{t.label}</span>
            <span>{t.title}</span>
          </button>
        ))}
      </div>

      {tab === "journey" && <JourneyTracker userState={state} userName={userName} />}
      {tab === "vault" && <DocumentVault userName={userName} />}
      {tab === "recommendations" && <Recommendations userName={userName} />}

      {tab === "calculator" && <>
      <StepIndicator current={step} total={3} labels={["Your situation", "Property details", "Your costs"]} />

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Which state are you buying in?</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.keys(STATES).map(k => <Pill key={k} active={state === k} onClick={() => setState(k)}>{k}</Pill>)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Your annual income (before tax)</label>
            <input type="text" value={`$${income.toLocaleString()}`} onChange={e => setIncome(Number(e.target.value.replace(/\D/g, "")) || 0)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Have you ever owned property in Australia?</label>
            <div style={{ display: "flex", gap: 6 }}>
              <Pill active={!hasOwned} onClick={() => setHasOwned(false)}>No, first time</Pill>
              <Pill active={hasOwned} onClick={() => setHasOwned(true)}>Yes, previously</Pill>
            </div>
          </div>
          <button onClick={() => setStep(1)} style={{
            width: "100%", padding: "14px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 12,
            background: "#1a1a1a", color: "#fff", cursor: "pointer", marginTop: 8, transition: "transform 0.1s",
          }}>Next: Property details</button>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Property price</label>
            <input type="text" value={`$${price.toLocaleString()}`} onChange={e => setPrice(Number(e.target.value.replace(/\D/g, "")) || 0)} style={inputStyle} />
            <input type="range" min={200000} max={1500000} step={10000} value={price} onChange={e => setPrice(Number(e.target.value))} style={{ width: "100%", marginTop: 8 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>Your deposit (savings)</label>
            <input type="text" value={`$${deposit.toLocaleString()}`} onChange={e => setDeposit(Number(e.target.value.replace(/\D/g, "")) || 0)} style={inputStyle} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "#999" }}>LVR: {pct(lvr)}</span>
              <span style={{ fontSize: 12, color: lvr > 80 ? "#a32d2d" : "#0f6e56", fontWeight: 500 }}>
                {lvr > 95 ? "Very high risk" : lvr > 90 ? "LMI will be significant" : lvr > 80 ? "LMI applies" : "No LMI needed"}
              </span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 8 }}>New or existing home?</label>
            <div style={{ display: "flex", gap: 6 }}>
              <Pill active={isNew} onClick={() => setIsNew(true)}>New build</Pill>
              <Pill active={!isNew} onClick={() => setIsNew(false)}>Existing home</Pill>
            </div>
            {!isNew && <p style={{ fontSize: 12, color: "#c07020", marginTop: 8, lineHeight: 1.4 }}>Note: FHOG is only available for new homes in most states. Buying existing means you'll likely miss out on the grant.</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep(0)} style={{
              flex: 1, padding: "14px", fontSize: 15, fontWeight: 600, border: "1.5px solid #e0dfd9", borderRadius: 12,
              background: "transparent", color: "#555", cursor: "pointer",
            }}>Back</button>
            <button onClick={() => setStep(2)} style={{
              flex: 2, padding: "14px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 12,
              background: "#1a1a1a", color: "#fff", cursor: "pointer",
            }}>See my costs</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            <div style={{ background: "#f5f4ef", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Total upfront</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{fmt(calc.netUpfront)}</div>
            </div>
            <div style={{ background: calc.totalSavings > 0 ? "#e8f5ee" : "#f5f4ef", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: calc.totalSavings > 0 ? "#0f6e56" : "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>You could save</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: calc.totalSavings > 0 ? "#0f6e56" : "#1a1a1a", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{fmt(calc.totalSavings)}</div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1a1a1a" }}>Cost breakdown</h3>
            <CostRow label="Your deposit" value={fmt(deposit)} tip={`${pct(100 - lvr)} of purchase price`} />
            <CostRow label="Stamp duty" value={fmt(calc.stampDuty)} tip={calc.concession > 0 ? `Reduced by ${Math.round(calc.concession * 100)}% FHB concession` : "No concession applied"} />
            {calc.stampSaved > 0 && <CostRow label="FHB stamp duty savings" value={`-${fmt(calc.stampSaved)}`} highlight="green" indent tip="First home buyer concession applied" />}
            <CostRow label="Lenders mortgage insurance" value={fmt(calc.lmi - calc.lmiSavedByScheme)} tip={lvr <= 80 ? "Not required with 20%+ deposit" : "Required when deposit is under 20%"} />
            {calc.lmiSavedByScheme > 0 && <CostRow label="5% Deposit Scheme LMI waiver" value={`-${fmt(calc.lmiSavedByScheme)}`} highlight="green" indent tip="Government guarantees the gap, no LMI needed" />}
            <CostRow label="Conveyancer / solicitor" value={fmt(calc.conveyancing)} tip="Legal fees for contract review and settlement" />
            <CostRow label="Building + pest inspection" value={fmt(calc.inspections)} tip="Always get these done. Non-negotiable." />
            <CostRow label="Home + contents insurance" value={fmt(calc.insurance)} tip="Required by most lenders before settlement" />
            <CostRow label="Transfer / registration fee" value={fmt(calc.transferFee)} tip="Government fee to register the title transfer" />
            <CostRow label="Moving costs" value={fmt(calc.movingCosts)} tip="Removalists, cleaning, connections" />
            <div style={{ borderTop: "2px solid #1a1a1a", marginTop: 8, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Total needed</span>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(calc.netUpfront)}</span>
            </div>
          </div>

          {/* Grant eligibility */}
          <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1a1a1a" }}>Grants and schemes you may qualify for</h3>
            
            <GrantCard
              title={`First Home Owner Grant (${s.name})`}
              eligible={calc.fhogEligible}
              amount={calc.fhogEligible ? fmt(s.fhog.amount) : null}
              reason={hasOwned ? "You've previously owned property" : !isNew ? "Only available for new homes" : s.fhog.cap && price > s.fhog.cap ? `Property exceeds ${fmt(s.fhog.cap)} cap` : "You appear eligible"}
            />
            <GrantCard
              title="5% Deposit Scheme (Federal)"
              eligible={calc.fivePercentEligible}
              amount={calc.lmiSavedByScheme > 0 ? `Saves ${fmt(calc.lmiSavedByScheme)} LMI` : "LMI waiver"}
              reason={hasOwned ? "Must be first home buyer" : deposit < price * 0.05 ? "Need minimum 5% deposit" : "You appear eligible"}
            />
            <GrantCard
              title="Help to Buy (Federal)"
              eligible={calc.helpToBuyEligible}
              amount={isNew ? "Up to 40% equity" : "Up to 30% equity"}
              reason={hasOwned ? "Must be first home buyer" : income > 90000 ? "Income may exceed cap (check current limits)" : "You may be eligible"}
            />
            {calc.concession > 0 && (
              <GrantCard
                title={`FHB Stamp Duty Concession (${state})`}
                eligible={true}
                amount={`Saves ${fmt(calc.stampSaved)}`}
                reason={`${Math.round(calc.concession * 100)}% reduction applied`}
              />
            )}
          </div>

          {/* Things people miss */}
          <div style={{ background: "#fff8ed", border: "1.5px solid #f0e4cc", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: "#85500b" }}>Things first home buyers often miss</h3>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 13, color: "#6b4a1a", lineHeight: 2 }}>
              <li>You need a <b>conveyancer/solicitor</b> before making an offer, not after</li>
              <li>Get <b>pre-approval</b> first so you know your actual budget</li>
              <li><b>Building + pest inspections</b> can save you from a $50k+ mistake</li>
              <li>Budget for <b>3-6 months of repayments</b> as a safety buffer</li>
              <li>Your broker works for the lender. Consider an <b>independent mortgage broker</b></li>
              <li><b>Strata reports</b> for apartments can reveal nasty surprises (special levies)</li>
              <li>Cooling-off periods vary by state. In QLD it's 5 business days, but <b>auctions have none</b></li>
            </ul>
          </div>

          {/* Monthly repayment estimate */}
          <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>Estimated monthly repayments</h3>
            <p style={{ fontSize: 12, color: "#999", margin: "0 0 12px" }}>Based on {fmt(loanAmount)} loan at 6.2% over 30 years</p>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#1a1a1a" }}>
              {fmt(Math.round((loanAmount * (0.062/12) * Math.pow(1 + 0.062/12, 360)) / (Math.pow(1 + 0.062/12, 360) - 1)))}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#999" }}> /month</span>
            </div>
            <p style={{ fontSize: 12, color: "#999", margin: "8px 0 0" }}>Banks will stress-test at ~9% = {fmt(Math.round((loanAmount * (0.09/12) * Math.pow(1 + 0.09/12, 360)) / (Math.pow(1 + 0.09/12, 360) - 1)))}/mo</p>
          </div>

          <button onClick={() => setStep(0)} style={{
            width: "100%", padding: "14px", fontSize: 15, fontWeight: 600, border: "1.5px solid #e0dfd9", borderRadius: 12,
            background: "transparent", color: "#555", cursor: "pointer", marginTop: 4,
          }}>Start over</button>

          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            Estimates only. Stamp duty rates and grant eligibility change. Always verify with your state revenue office and a qualified professional.
          </p>
        </div>
      )}
      </>}
      <DevEditor />
    </div>
  );
}

function GrantCard({ title, eligible, amount, reason }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
      borderBottom: "1px solid #f0efe9",
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        background: eligible ? "#e8f5ee" : "#faf0f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: eligible ? "#0f6e56" : "#a32d2d",
      }}>{eligible ? "\u2713" : "\u2717"}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{reason}</div>
      </div>
      {eligible && amount && (
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f6e56", whiteSpace: "nowrap" }}>{amount}</div>
      )}
    </div>
  );
}
