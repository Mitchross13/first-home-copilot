import { useState, useEffect } from "react";

const STORAGE_KEY = "fhc_vault";

const ASSET_FIELDS = [
  { id: "savings",    label: "Cash savings",          placeholder: "e.g. 65000",  tip: "Total across all savings/transaction accounts" },
  { id: "super",      label: "Superannuation",         placeholder: "e.g. 42000",  tip: "Your current super balance — lenders may consider this" },
  { id: "shares",     label: "Shares / investments",   placeholder: "e.g. 10000",  tip: "ASX, ETFs, crypto — market value" },
  { id: "car",        label: "Vehicle value",          placeholder: "e.g. 15000",  tip: "Estimated current market value" },
  { id: "other",      label: "Other assets",           placeholder: "e.g. 5000",   tip: "Jewellery, business interests, other property" },
];

const LIABILITY_FIELDS = [
  { id: "hecs",       label: "HECS / HELP debt",       placeholder: "e.g. 25000",  tip: "Outstanding student loan balance — reduces your borrowing capacity" },
  { id: "creditcard", label: "Credit card limits",     placeholder: "e.g. 5000",   tip: "Total credit limits (not balance) — lenders use the full limit" },
  { id: "carloan",    label: "Car loan balance",       placeholder: "e.g. 12000",  tip: "Outstanding balance on any vehicle finance" },
  { id: "bnpl",       label: "Buy now pay later",      placeholder: "e.g. 500",    tip: "AfterPay, Zip, Klarna — even $0 balance accounts count" },
  { id: "personal",   label: "Personal loans",         placeholder: "e.g. 0",      tip: "Any other outstanding loans" },
  { id: "other",      label: "Other liabilities",      placeholder: "e.g. 0",      tip: "Any other debts or financial obligations" },
];

const INCOME_FIELDS = [
  { id: "base",       label: "Base salary (before tax)",     placeholder: "e.g. 85000",  tip: "Your annual gross salary" },
  { id: "partner",    label: "Partner income (if buying together)", placeholder: "e.g. 0", tip: "Leave as 0 if buying solo" },
  { id: "rental",     label: "Rental income",                placeholder: "e.g. 0",      tip: "If you own other property" },
  { id: "other",      label: "Other regular income",         placeholder: "e.g. 0",      tip: "Freelance, dividends, government payments" },
];

function fmt(n) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);
}

function sum(fields, values) {
  return fields.reduce((acc, f) => acc + (Number(String(values[f.id] || "0").replace(/\D/g, "")) || 0), 0);
}

function Section({ title, subtitle, fields, values, onChange, accent }) {
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14,
      padding: "18px 20px", marginBottom: 16,
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px", color: accent || "#1a1a1a" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{subtitle}</p>}
      </div>
      {fields.map(f => (
        <div key={f.id} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{f.label}</label>
            <span
              title={f.tip}
              style={{ fontSize: 10, color: "#bbb", border: "1px solid #e0e0e0", borderRadius: "50%", width: 15, height: 15, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "help" }}
            >?</span>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#aaa", fontFamily: "monospace" }}>$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder={f.placeholder}
              value={values[f.id] || ""}
              onChange={e => onChange(f.id, e.target.value.replace(/[^\d]/g, ""))}
              style={{
                width: "100%", padding: "10px 12px 10px 26px", fontSize: 15,
                border: "1.5px solid #e0dfd9", borderRadius: 10, background: "#fafaf7",
                outline: "none", fontFamily: "'DM Mono', monospace", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value, highlight, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0efe9" }}>
      <span style={{ fontSize: 14, color: bold ? "#1a1a1a" : "#666", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 14, fontFamily: "monospace", fontWeight: bold ? 700 : 500, color: highlight || "#1a1a1a" }}>{value}</span>
    </div>
  );
}

export default function DocumentVault({ userName }) {
  const firstName = userName ? userName.split(" ")[0] : null;
  const [assets, setAssets] = useState({});
  const [liabilities, setLiabilities] = useState({});
  const [income, setIncome] = useState({});
  const [employmentType, setEmploymentType] = useState("payg");
  const [activeTab, setActiveTab] = useState("income");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      if (saved.assets) setAssets(saved.assets);
      if (saved.liabilities) setLiabilities(saved.liabilities);
      if (saved.income) setIncome(saved.income);
      if (saved.employmentType) setEmploymentType(saved.employmentType);
    } catch {}
  }, []);

  function save(newData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }

  function updateAssets(id, val) {
    const next = { ...assets, [id]: val };
    setAssets(next);
    save({ assets: next, liabilities, income, employmentType });
  }

  function updateLiabilities(id, val) {
    const next = { ...liabilities, [id]: val };
    setLiabilities(next);
    save({ assets, liabilities: next, income, employmentType });
  }

  function updateIncome(id, val) {
    const next = { ...income, [id]: val };
    setIncome(next);
    save({ assets, liabilities, income: next, employmentType });
  }

  const totalAssets = sum(ASSET_FIELDS, assets);
  const totalLiabilities = sum(LIABILITY_FIELDS, liabilities);
  const totalIncome = sum(INCOME_FIELDS, income);
  const netPosition = totalAssets - totalLiabilities;

  // Rough borrowing capacity: ~6x gross income, minus liabilities * 6, minus credit card limits * 3
  const creditCardLimit = Number(liabilities.creditcard || 0);
  const roughBorrow = Math.max(0, totalIncome * 6 - totalLiabilities * 6 - creditCardLimit * 3);

  const tabs = ["income", "assets", "liabilities", "summary"];

  return (
    <div style={{ fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" }}>
          {firstName ? `${firstName}'s Financial Picture` : "Your Financial Picture"}
        </h2>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          This stays on your device. Fill it in once — we'll use it throughout the app.
        </p>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f0efe9", borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: "8px 4px", fontSize: 12, fontWeight: 600,
            border: "none", borderRadius: 7, cursor: "pointer", textTransform: "capitalize",
            background: activeTab === t ? "#fff" : "transparent",
            color: activeTab === t ? "#1a1a1a" : "#888",
            boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>{t}</button>
        ))}
      </div>

      {activeTab === "income" && (
        <>
          <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Employment type</h3>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id: "payg", label: "PAYG employed" },
                { id: "self", label: "Self-employed" },
                { id: "contract", label: "Contractor" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setEmploymentType(opt.id)} style={{
                  flex: 1, padding: "10px 6px", fontSize: 13, fontWeight: 600,
                  border: "2px solid transparent", borderRadius: 10, cursor: "pointer",
                  background: employmentType === opt.id ? "#1a1a1a" : "#f5f4ef",
                  color: employmentType === opt.id ? "#fff" : "#555",
                }}>{opt.label}</button>
              ))}
            </div>
            {employmentType === "self" && (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "#fff8ed", borderRadius: 8, border: "1px solid #f0e4cc" }}>
                <p style={{ fontSize: 12, color: "#6b4a1a", margin: 0, lineHeight: 1.5 }}>
                  Self-employed borrowers typically need 2 years of tax returns. Lenders use your average taxable income, not your gross revenue.
                </p>
              </div>
            )}
          </div>
          <Section
            title="Income"
            subtitle="Annual figures, before tax"
            fields={INCOME_FIELDS}
            values={income}
            onChange={updateIncome}
          />
          <div style={{ background: "#e8f5ee", borderRadius: 12, padding: "14px 18px" }}>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 4px", fontWeight: 600 }}>Estimated borrowing capacity</p>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#0f6e56", margin: "0 0 4px" }}>{fmt(roughBorrow)}</p>
            <p style={{ fontSize: 11, color: "#888", margin: 0 }}>Rough estimate only — actual capacity depends on lender, expenses, and interest rate used.</p>
          </div>
        </>
      )}

      {activeTab === "assets" && (
        <Section
          title="Assets"
          subtitle="What you own"
          fields={ASSET_FIELDS}
          values={assets}
          onChange={updateAssets}
          accent="#0f6e56"
        />
      )}

      {activeTab === "liabilities" && (
        <>
          <Section
            title="Liabilities"
            subtitle="What you owe — be honest, lenders will find everything"
            fields={LIABILITY_FIELDS}
            values={liabilities}
            onChange={updateLiabilities}
            accent="#a32d2d"
          />
          <div style={{ padding: "12px 16px", background: "#fff8ed", borderRadius: 10, border: "1px solid #f0e4cc" }}>
            <p style={{ fontSize: 12, color: "#6b4a1a", margin: 0, lineHeight: 1.6 }}>
              <strong>Credit cards:</strong> Lenders assess the full limit, not your current balance. A $10,000 card with $0 owing still reduces your borrowing capacity. Consider reducing limits before applying.
            </p>
          </div>
        </>
      )}

      {activeTab === "summary" && (
        <div style={{ background: "#fff", border: "1.5px solid #e8e7e2", borderRadius: 14, padding: "18px 20px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Your financial summary</h3>

          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>Income</p>
          <SummaryRow label="Total annual income" value={fmt(totalIncome)} />

          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px" }}>Assets</p>
          {ASSET_FIELDS.map(f => assets[f.id] && Number(assets[f.id]) > 0 ? (
            <SummaryRow key={f.id} label={f.label} value={fmt(Number(assets[f.id]))} />
          ) : null)}
          <SummaryRow label="Total assets" value={fmt(totalAssets)} highlight="#0f6e56" bold />

          <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px" }}>Liabilities</p>
          {LIABILITY_FIELDS.map(f => liabilities[f.id] && Number(liabilities[f.id]) > 0 ? (
            <SummaryRow key={f.id} label={f.label} value={fmt(Number(liabilities[f.id]))} />
          ) : null)}
          <SummaryRow label="Total liabilities" value={fmt(totalLiabilities)} highlight="#a32d2d" bold />

          <div style={{ borderTop: "2px solid #1a1a1a", marginTop: 12, paddingTop: 12 }}>
            <SummaryRow label="Net position" value={fmt(netPosition)} highlight={netPosition >= 0 ? "#0f6e56" : "#a32d2d"} bold />
            <SummaryRow label="Est. borrowing capacity" value={fmt(roughBorrow)} bold />
          </div>

          <p style={{ fontSize: 11, color: "#bbb", marginTop: 14, lineHeight: 1.5 }}>
            This summary is what your mortgage broker or bank will reconstruct from your documents. Having it ready saves hours.
          </p>
        </div>
      )}
    </div>
  );
}
