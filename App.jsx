 import { useState, useEffect, useRef } from "react";

// --- CONFIG & THEME ---
const SYMBOLS = {
  XAUUSD: { label: "XAU/USD", tv: "OANDA:XAUUSD", color: "#FFD700" },
  BTCUSD: { label: "BTC/USD", tv: "BINANCE:BTCUSD", color: "#F7931A" },
};

// --- COMPONENT: REAL-TIME CHART ---
function TradingViewChart({ symbol }) {
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
          interval: "5", // เริ่มต้นที่ 5 นาทีเพื่อความไว
          timezone: "Asia/Bangkok",
          theme: "dark",
          style: "1",
          locale: "th",
          toolbar_bg: "#0a0f1c",
          enable_publishing: false,
          hide_side_toolbar: false, // เปิดให้ตีเส้นได้
          allow_symbol_change: true,
          details: true,
          show_popup_button: true,
          // โหลด Indicators ตามสั่ง
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
            "moving average.1.length": 9,
            "moving average.1.color": "#ff4466",
            "moving average.2.length": 50,
            "moving average.2.color": "#0088ff",
          }
        });
      }
    };
    document.head.appendChild(script);
  }, [symbol]);

  return <div id={`tv_chart_${symbol}`} ref={containerRef} style={{ height: "550px", width: "100%" }} />;
}

// --- MAIN APP ---
export default function App() {
  const [symbol, setSym] = useState("XAUUSD");
  const [checklist, setChecklist] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [aiReport, setAiReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // 1. Persistence Checklist (บันทึกแยกเครื่อง)
  useEffect(() => {
    const saved = localStorage.getItem("trader_checklist_v2");
    setChecklist(saved ? JSON.parse(saved) : [
      { id: 1, text: "EMA 9 ตัดเหนือ EMA 50 (Golden Cross)", checked: false },
      { id: 2, text: "MACD Histogram เปลี่ยนเป็นสีเขียว", checked: false },
      { id: 3, text: "ราคาไม่ทำ Low ใหม่ (Higher Low)", checked: false }
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem("trader_checklist_v2", JSON.stringify(checklist));
  }, [checklist]);

  // 2. AI Brain: Multi-TF Calculation Logic
  const runSmartAI = () => {
    setIsScanning(true);
    // จำลองการ Scan ข้อมูลจาก Server หรือ API กราฟ
    setTimeout(() => {
      const trends = ["BULLISH", "BEARISH", "SIDEWAY"];
      const m5 = trends[Math.floor(Math.random() * 3)];
      const m30 = trends[Math.floor(Math.random() * 3)];
      const h1 = trends[Math.floor(Math.random() * 3)];

      // คำนวณความน่าจะเป็น (Logic Sim)
      let score = 0;
      if (m1 === "BULLISH") score += 30;
      if (m30 === "BULLISH") score += 40;
      if (h1 === "BULLISH") score += 30;

      const recommendation = score >= 70 ? "STRONG BUY" : score <= 30 ? "STRONG SELL" : "WAIT / SIDEWAY";
      
      setAiReport({ m5, m30, h1, score, recommendation });
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: "#02050e", color: "#eef", minHeight: "100vh", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto 20px" }}>
        <h2 style={{ color: SYMBOLS[symbol].color, letterSpacing: "1px", margin: 0 }}>
          {SYMBOLS[symbol].label} <span style={{ fontSize: "12px", color: "#667" }}>PRO TERMINAL</span>
        </h2>
        <div>
          {Object.keys(SYMBOLS).map(s => (
            <button key={s} onClick={() => setSym(s)} style={{
              marginLeft: "10px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #334",
              background: symbol === s ? SYMBOLS[s].color : "#161b2c",
              color: symbol === s ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer"
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* กราฟ Real-time */}
        <section style={{ background: "#0a0f1c", borderRadius: "16px", overflow: "hidden", border: "1px solid #1e293b", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <TradingViewChart symbol={SYMBOLS[symbol].tv} />
        </section>

        {/* แถบเครื่องมือ AI & Checklist */}
        <aside>
          {/* AI Deep Scan */}
          <div style={{ background: "linear-gradient(145deg, #1e293b, #0f172a)", padding: "20px", borderRadius: "16px", border: "1px solid #334", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#38bdf8", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span> AI SMART ANALYSIS
            </h3>
            <button 
              onClick={runSmartAI} 
              disabled={isScanning}
              style={{ 
                width: "100%", padding: "12px", borderRadius: "10px", border: "none", 
                background: "#38bdf8", color: "#000", fontWeight: "bold", cursor: "pointer",
                boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)"
              }}
            >
              {isScanning ? "Scanning Markets..." : "Deep Scan (5M, 30M, 1H)"}
            </button>

            {aiReport && (
              <div style={{ marginTop: "20px", animation: "fadeIn 0.5s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", textAlign: "center", marginBottom: "15px" }}>
                  <div style={{ background: "#0003", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>TF 5M</div>
                    <div style={{ fontWeight: "bold", color: aiReport.m5 === "BULLISH" ? "#22c55e" : "#ef4444" }}>{aiReport.m5}</div>
                  </div>
                  <div style={{ background: "#0003", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>TF 30M</div>
                    <div style={{ fontWeight: "bold", color: aiReport.m30 === "BULLISH" ? "#22c55e" : "#ef4444" }}>{aiReport.m30}</div>
                  </div>
                  <div style={{ background: "#0003", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>TF 1H</div>
                    <div style={{ fontWeight: "bold", color: aiReport.h1 === "BULLISH" ? "#22c55e" : "#ef4444" }}>{aiReport.h1}</div>
                  </div>
                </div>
                
                <div style={{ textAlign: "center", borderTop: "1px solid #334", paddingTop: "15px" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Win Probability Score</div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#38bdf8" }}>{aiReport.score}%</div>
                  <div style={{ marginTop: "5px", padding: "5px 10px", background: "#38bdf822", borderRadius: "5px", color: "#38bdf8", fontWeight: "bold", display: "inline-block" }}>
                    {aiReport.recommendation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checklist System */}
          <div style={{ background: "#0f172a", padding: "20px", borderRadius: "16px", border: "1px solid #1e293b" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>📝 TRADE CHECKLIST</h3>
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
              <input 
                type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                placeholder="เพิ่มกฎการเข้าเทรด..."
                style={{ flex: 1, background: "#1e293b", border: "1px solid #334", color: "#fff", padding: "10px", borderRadius: "8px" }}
              />
              <button onClick={() => {
                if(!newItem) return;
                setChecklist([...checklist, { id: Date.now(), text: newItem, checked: false }]);
                setNewItem("");
              }} style={{ background: "#334", color: "#fff", border: "none", padding: "0 15px", borderRadius: "8px", cursor: "pointer" }}>+</button>
            </div>

            <div style={{ maxHeight: "250px", overflowY: "auto" }}>
              {checklist.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px", padding: "12px", background: item.checked ? "#1e293b55" : "#1e293b", borderRadius: "10px", transition: "0.3s" }}>
                  <input 
                    type="checkbox" checked={item.checked} 
                    onChange={() => setChecklist(checklist.map(c => c.id === item.id ? {...c, checked: !c.checked} : c))}
                    style={{ width: "18px", height: "18px", cursor: "pointer", marginRight: "12px" }}
                  />
                  <span style={{ flex: 1, fontSize: "13px", textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "#475569" : "#cbd5e1" }}>
                    {item.text}
                  </span>
                  <button onClick={() => setChecklist(checklist.filter(c => c.id !== item.id))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", opacity: 0.6 }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #334; borderRadius: 10px; }
      `}</style>
    </div>
  );
                    }
