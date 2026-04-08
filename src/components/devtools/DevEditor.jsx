import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Change the primary button colour to deep blue",
  "Add a tooltip explaining what LMI means next to the LMI row in the calculator",
  "Make the welcome screen tagline more energetic",
  "Add a 'share' button to the cost breakdown",
  "Change the Savings stage checklist to add a task about the First Home Super Saver scheme",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: "85%", padding: "10px 13px", borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isUser ? "#1a1a1a" : "#f5f4ef",
        color: isUser ? "#fff" : "#1a1a1a",
        fontSize: 13, lineHeight: 1.55,
        whiteSpace: "pre-wrap",
      }}>
        {msg.content}
        {msg.written?.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: isUser ? "1px solid #333" : "1px solid #ddd" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isUser ? "#aaa" : "#0f6e56", marginBottom: 4 }}>
              ✓ Files updated:
            </div>
            {msg.written.map(f => (
              <div key={f} style={{ fontSize: 11, fontFamily: "monospace", color: isUser ? "#ccc" : "#555" }}>{f}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DevEditor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey 👋 I'm your in-app editor. Tell me what to change and I'll update the code and hot-reload it instantly.\n\nTry: \"make the primary colour green\" or \"add a disclaimer to the calculator\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function send() {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply || (data.written?.length ? "Done." : "No changes made."),
          written: data.written,
        }]);
        if (data.written?.length > 0) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "↑ Files saved. Vite is hot-reloading now — check the app.",
            }]);
          }, 800);
        }
      }
    } catch (e) {
      setError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Only render in dev mode
  if (!import.meta.env.DEV) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="AI Editor (dev only)"
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999,
          width: 48, height: 48, borderRadius: "50%",
          background: open ? "#1a1a1a" : "#6d28d9",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          transition: "all 0.2s",
        }}
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 9998,
          width: 340, height: 480,
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column",
          border: "1.5px solid #e0dfd9",
          fontFamily: "'Instrument Sans', 'Segoe UI', sans-serif",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 16px", background: "#6d28d9",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>✦</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Editor</div>
              <div style={{ fontSize: 10, color: "#c4b5fd" }}>Dev mode only • claude-haiku</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px" }}>
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                <div style={{ padding: "10px 14px", background: "#f5f4ef", borderRadius: "14px 14px 14px 4px", fontSize: 13, color: "#888" }}>
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <div style={{ padding: "8px 12px", background: "#fff0f0", borderRadius: 8, fontSize: 12, color: "#a32d2d", marginBottom: 8 }}>
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: "4px 12px 8px", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {SUGGESTIONS.slice(0, 2).map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  fontSize: 11, padding: "4px 9px", borderRadius: 10,
                  background: "#f0eeff", color: "#6d28d9", border: "none", cursor: "pointer",
                  fontFamily: "inherit", lineHeight: 1.4, textAlign: "left",
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "8px 10px 10px", borderTop: "1px solid #f0efe9" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Tell me what to change..."
                rows={2}
                style={{
                  flex: 1, padding: "8px 10px", fontSize: 13,
                  border: "1.5px solid #e0dfd9", borderRadius: 10,
                  background: "#fafaf7", outline: "none", resize: "none",
                  fontFamily: "inherit", lineHeight: 1.4,
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  padding: "8px 12px", borderRadius: 10, border: "none",
                  background: input.trim() && !loading ? "#6d28d9" : "#e0dfd9",
                  color: input.trim() && !loading ? "#fff" : "#aaa",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  fontSize: 16, transition: "all 0.15s",
                }}
              >
                ↑
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#ccc", margin: "5px 0 0", textAlign: "center" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
