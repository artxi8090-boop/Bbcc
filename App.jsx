import { useState, useEffect, useRef } from "react";

const BRAND_NAME = "TRADING CHECKLIST PRO";
const SYMBOLS = {
  XAUUSD: { label: "XAU/USD", tv: "OANDA:XAUUSD", color: "#FFD700" },
  BTCUSD: { label: "BTC/USD", tv: "BINANCE:BTCUSD", color: "#F7931A" },
};

// --- TRADINGVIEW WIDGET COMPONENT ---
function TradingViewChart({ symbol, isAdmin }) {
  const containerRef = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: containerRef.current.id,
          symbol: symbol,
          interval: "H1",
          timezone: "Asia/Bangkok",
          theme: "dark",
          style: "1",
          locale: "th",
          toolbar_bg: "#0a0f1c",
          enable_publishing: false,
          hide_side_toolbar: !isAdmin, // แอดมินเห็นแถบเครื่องมือตีเส้น
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          // ตั้งค่า Indicators เริ่มต้น
          studies: [
            "MASimple@tv-basicstudies", // EMA 9
            "MASimple@tv-basicstudies", // EMA 50
            "MACD@tv-basicstudies",
            "SuperTrend@tv-basicstudies"
          ],
          overrides: {
            "mainSeriesProperties.statusLineProperties.showCountdown": true, // นับถอยหลังแท่งเทียน
          },
          studies_overrides: {
            "ma.precision": 2,
            "moving average.1.length": 9,
            "moving average.1.color": "#ff4466", // EMA 9 แดง
            "moving average.2.length": 50,
            "moving average.2.color": "#0088ff", // EMA 50 น้ำเงิน
          }
        });
      }
    };
    document.head.appendChild(script);
  }, [symbol, isAdmin]);

  return <div id={`tv_chart_${symbol}`} ref={containerRef} style={{ height: "500px", width: "100%" }} />;
}

// --- MAIN APP ---
export default function App() {
  const [symbol, setSym] = useState("XAUUSD");
  const [checklist, setChecklist] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [aiResult, setAiResult] = useState(null);

  // 1. Load Checklist จาก LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("my_checklist");
    if (saved) setChecklist(JSON.parse(saved));
    else setChecklist([
      { id: 1, text: "ยืนเหนือ EMA 50", checked: false },
      { id: 2, text: "MACD ตัดขึ้น", checked: false }
    ]);
  }, []);

  // 2. Save Checklist เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem("my_checklist", JSON.stringify(checklist));
  }, [checklist]);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addCheckItem = () => {
    if (!newItem) return;
    setChecklist([...checklist, { id: Date.now(), text: newItem, checked: false }]);
    setNewItem("");
  };

  const removeCheckItem = (id) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  // 3. AI Analysis Simulation (วิเคราะห์จาก TF)
  const runAIAnalysis = () => {
    setAiResult("กำลังประมวลผลแรงซื้อขาย...");
    setTimeout(() => {
      const signals = ["STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"];
      const getRand = () => signals[Math.floor(Math.random() * signals.length)];
      setAiResult({
        m5: getRand(),
        m30: getRand(),
        h1: getRand(),
        summary: "พิจารณาเข้าออเดอร์เมื่อสัญญาณตรงกันอย่างน้อย 2 Timeframes"
      });
    }, 1500);
  };

  return (
    <div style={{ backgroundColor: "#020509", color: "#fff", minHeight: "100vh", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: SYMBOLS[symbol].color, margin: 0 }}>{BRAND_NAME}</h1>
        <div style={{ marginTop: "10px" }}>
          {Object.keys(SYMBOLS).map(s => (
            <button key={s} onClick={() => setSym(s)} style={{
              margin: "0 5px", padding: "8px 15px", borderRadius: "20px",
              background: symbol === s ? SYMBOLS[s].color : "#1a1e2a",
              color: symbol === s ? "#000" : "#fff", border: "none", cursor: "pointer"
            }}>{SYMBOLS[s].label}</button>
          ))}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* LEFT: REAL-TIME CHART */}
        <section style={{ background: "#0a0f1c", borderRadius: "15px", overflow: "hidden", border: "1px solid #222" }}>
          <TradingViewChart symbol={SYMBOLS[symbol].tv} isAdmin={true} />
        </section>

        {/* RIGHT: TOOLS & CHECKLIST */}
        <aside>
          {/* AI Analysis Box */}
          <div style={{ background: "linear-gradient(145deg, #161b2c, #0a0f1c)", padding: "15px", borderRadius: "15px", marginBottom: "20px", border: "1px solid #333" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#00ff88" }}>🤖 AI Multi-TF Analysis</h3>
            <button onClick={runAIAnalysis} style={{ width: "100%", padding: "10px", background: "#00ff88", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>วิเคราะห์กราฟปัจจุบัน</button>
            
            {aiResult && typeof aiResult === 'object' && (
              <div style={{ marginTop: "15px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>TF 5M:</span> <span style={{ fontWeight: "bold" }}>{aiResult.m5}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>TF 30M:</span> <span style={{ fontWeight: "bold" }}>{aiResult.m30}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span>TF 1H:</span> <span style={{ fontWeight: "bold" }}>{aiResult.h1}</span>
                </div>
                <p style={{ fontSize: "11px", color: "#889", borderTop: "1px solid #333", paddingTop: "10px" }}>{aiResult.summary}</p>
              </div>
            )}
          </div>

          {/* Checklist Box */}
          <div style={{ background: "#0a0f1c", padding: "15px", borderRadius: "15px", border: "1px solid #222" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>📝 My Entry Checklist</h3>
            
            <div style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
              <input 
                type="text" 
                value={newItem} 
                onChange={(e) => setNewItem(e.target.value)} 
                placeholder="เพิ่มข้อตกลง..."
                style={{ flex: 1, background: "#1a1e2a", border: "1px solid #333", color: "#fff", padding: "8px", borderRadius: "5px" }}
              />
              <button onClick={addCheckItem} style={{ background: "#333", color: "#fff", border: "none", padding: "0 15px", borderRadius: "5px", cursor: "pointer" }}>+</button>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {checklist.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", background: "#161b2c", padding: "10px", borderRadius: "8px" }}>
                  <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} style={{ marginRight: "10px", transform: "scale(1.2)" }} />
                  <span style={{ flex: 1, fontSize: "14px", textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#555" : "#fff" }}>{item.text}</span>
                  <button onClick={() => removeCheckItem(item.id)} style={{ background: "transparent", border: "none", color: "#ff4466", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
       }
