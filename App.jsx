import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════
//  CONSTANTS & CONFIGURATION
// ════════════════════════════════════════════════════════════
const BRAND_NAME = "Trading Checklist Pro";
const POLL_MS = 4000; 

// วิธีที่ถูกต้องในการเก็บรหัสผ่านสำหรับ Frontend คือใช้ Environment Variable
// เช่น ใน Vite ให้สร้างไฟล์ .env และใส่ VITE_ADMIN_PASS=Arttrader888@
// แต่ถ้าคุณยังไม่มี Backend หรือ .env นี่คือตัวแปรที่รับค่าจาก .env ครับ
const ADMIN_PASS = import.meta.env?.VITE_ADMIN_PASS || "Arttrader888@"; 

const SYMBOLS = {
  XAUUSD: { 
    label: "XAU/USD", icon: "⚡", pip: 0.01, contract: 100, 
    color: "#FFD700", defPrice: 2320, spread: 0.3, tv: "OANDA:XAUUSD" 
  },
  BTCUSD: { 
    label: "BTC/USD", icon: "₿", pip: 1, contract: 1, 
    color: "#F7931A", defPrice: 67500, spread: 15, tv: "BINANCE:BTCUSD" 
  },
};

const G = "#00ff88", R = "#ff4466";

// ════════════════════════════════════════════════════════════
//  COMPONENTS
// ════════════════════════════════════════════════════════════

function SpaceBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 1200,
      r: Math.random() * 1.5,
      opacity: Math.random(),
      speed: 0.005 + Math.random() * 0.01
    }));

    const animate = () => {
      ctx.fillStyle = "#020509";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.opacity += s.speed;
        if (s.opacity > 1 || s.opacity < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x % canvas.width, s.y % canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.opacity)})`;
        ctx.fill();
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }} />;
}

const GlassCard = ({ children, style = {}, glow }) => (
  <div style={{
    background: "rgba(10, 15, 28, 0.8)",
    backdropFilter: "blur(15px)",
    borderRadius: "16px",
    border: `1px solid ${glow ? glow + "44" : "rgba(255,255,255,0.1)"}`,
    boxShadow: glow ? `0 0 20px ${glow}22` : "none",
    ...style
  }}>
    {children}
  </div>
);

// ════════════════════════════════════════════════════════════
//  MAIN APPLICATION
// ════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState("chart");
  const [symbol, setSym] = useState("XAUUSD");
  const [adminAuth, setAdminAuth] = useState(false);
  const [passInput, setPassInput] = useState("");
  
  // Calc States
  const [entry, setEntry] = useState(SYMBOLS.XAUUSD.defPrice);
  const [spread, setSpread] = useState(SYMBOLS.XAUUSD.spread);
  const [slPips, setSlPips] = useState(50);
  const [tpPips, setTpPips] = useState(100);
  const [balance, setBalance] = useState(10000); // จำลอง Balance เริ่มต้น
  const [riskPct, setRiskPct] = useState(1);
  const [direction, setDirection] = useState("BUY");

  const sym = SYMBOLS[symbol];

  // Auto Lot Calculation
  const riskAmt = (balance * riskPct) / 100;
  const lotSize = Math.max(0.01, riskAmt / (slPips * sym.contract * sym.pip));
  const profit = lotSize * sym.contract * (tpPips * sym.pip);
  const loss = lotSize * sym.contract * (slPips * sym.pip);

  useEffect(() => {
    setEntry(sym.defPrice);
    setSpread(sym.spread);
  }, [symbol, sym.defPrice, sym.spread]);

  const navItemStyle = (active) => ({
    flex: 1, padding: "12px", border: "none", borderRadius: "8px",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    color: active ? "#fff" : "#889", cursor: "pointer", fontWeight: "bold", transition: "0.3s"
  });

  const inputGroupStyle = { marginBottom: "15px" };
  const labelStyle = { display: "block", fontSize: "12px", color: "#889", marginBottom: "5px" };
  const inputStyle = { 
    width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)", 
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", 
    color: "#fff", fontFamily: "monospace", boxSizing: "border-box" 
  };

  const handleLogin = () => {
    if (passInput === ADMIN_PASS) {
      setAdminAuth(true);
      setPassInput(""); // เคลียร์รหัสออกจากช่องเพื่อความปลอดภัย
    } else {
      alert("รหัสผ่านไม่ถูกต้อง!");
    }
  };

  return (
    <div style={{ minHeight: "100vh", color: "#dde", position: "relative" }}>
      <SpaceBackground />
      
      <div style={{ position: "relative", zIndex: 1, maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
        
        {/* Branding */}
        <header style={{ textAlign: "center", marginBottom: "25px" }}>
          <h1 style={{ color: sym.color, fontSize: "28px", margin: 0, letterSpacing: "2px", textTransform: "uppercase" }}>{BRAND_NAME}</h1>
          <p style={{ fontSize: "10px", color: "#556" }}>ADVANCED TRADING TERMINAL</p>
          
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
            {Object.keys(SYMBOLS).map(s => (
              <button key={s} onClick={() => setSym(s)} style={{
                padding: "8px 20px", borderRadius: "20px", border: `1px solid ${SYMBOLS[s].color}`,
                background: symbol === s ? SYMBOLS[s].color : "transparent",
                color: symbol === s ? "#000" : "#fff", cursor: "pointer", fontWeight: "bold", transition: "0.3s"
              }}>
                {SYMBOLS[s].icon} {SYMBOLS[s].label}
              </button>
            ))}
          </div>
        </header>

        {/* Navigation */}
        <nav style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "5px", borderRadius: "12px", marginBottom: "20px" }}>
          <button onClick={() => setPage("chart")} style={navItemStyle(page === "chart")}>📈 กราฟ</button>
          <button onClick={() => setPage("calc")} style={navItemStyle(page === "calc")}>📊 คำนวณ</button>
          <button onClick={() => setPage("admin")} style={navItemStyle(page === "admin")}>🔐 Admin</button>
        </nav>

        {/* Content Pages */}
        {page === "chart" && (
          <GlassCard style={{ overflow: "hidden" }}>
            {/* อัปเดตพารามิเตอร์ Iframe ให้รองรับ Advanced Widget */}
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${sym.tv}&interval=H1&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&theme=dark&style=1&timezone=Asia/Bangkok`}
              style={{ width: "100%", height: "400px", border: "none" }}
              title="TradingView Chart"
            />
          </GlassCard>
        )}

        {page === "calc" && (
          <GlassCard style={{ padding: "20px" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button onClick={() => setDirection("BUY")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: direction === "BUY" ? G : "#1a2e25", color: direction === "BUY" ? "#000" : G, fontWeight: "bold", cursor: "pointer" }}>BUY</button>
              <button onClick={() => setDirection("SELL")} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: direction === "SELL" ? R : "#2e1a1e", color: direction === "SELL" ? "#000" : R, fontWeight: "bold", cursor: "pointer" }}>SELL</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>ราคาเข้า (Entry)</label>
                <input type="number" value={entry} onChange={e => setEntry(Number(e.target.value))} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label style={{...labelStyle, color: sym.color}}>สเปรด (Spread Pips)</label>
                <input type="number" value={spread} onChange={e => setSpread(Number(e.target.value))} style={{...inputStyle, borderColor: sym.color}} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Stop Loss (Pips)</label>
                <input type="number" value={slPips} onChange={e => setSlPips(Number(e.target.value))} style={inputStyle} />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Take Profit (Pips)</label>
                <input type="number" value={tpPips} onChange={e => setTpPips(Number(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <GlassCard glow={sym.color} style={{ padding: "15px", marginTop: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#889" }}>ล็อตที่แนะนำ (Recommended Lot)</div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: sym.color }}>{lotSize.toFixed(2)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px" }}>
                <span style={{ color: G }}>กำไร: ${profit.toFixed(2)}</span>
                <span style={{ color: R }}>ขาดทุน: ${loss.toFixed(2)}</span>
              </div>
            </GlassCard>
          </GlassCard>
        )}

        {page === "admin" && (
          <GlassCard style={{ padding: "20px" }}>
            {!adminAuth ? (
              <div style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "15px" }}>Admin Access</h3>
                <input 
                  type="password" 
                  placeholder="รหัสผ่าน..." 
                  value={passInput}
                  style={{...inputStyle, textAlign: "center", marginBottom: "15px"}} 
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button 
                  onClick={handleLogin}
                  style={{ width: "100%", padding: "12px", background: sym.color, border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", color: "#000" }}
                >เข้าสู่ระบบ</button>
              </div>
            ) : (
              <div>
                <h3 style={{ color: G, marginBottom: "10px" }}>โหมดแอดมิน (Full Tools)</h3>
                <p style={{ fontSize: "12px", color: "#889", marginBottom: "15px" }}>
                  * การตีเส้นใน Widget ฟรียังไม่สามารถ Sync ให้หน้าจอของคนอื่นเห็นได้แบบ Real-time ครับ หากต้องการฟีเจอร์นั้นจะต้องมีการเขียนเชื่อมต่อ WebSockets คู่กับ Firebase แยกต่างหาก
                </p>
                <iframe 
                  src={`https://s.tradingview.com/widgetembed/?symbol=${sym.tv}&interval=H1&hidesidetoolbar=0&theme=dark&style=1&withdateranges=1&details=1`}
                  style={{ width: "100%", height: "450px", border: "none", borderRadius: "8px" }}
                  title="TradingView Admin Chart"
                />
                <button 
                  onClick={() => setAdminAuth(false)} 
                  style={{ width: "100%", marginTop: "15px", padding: "10px", background: "transparent", border: `1px solid ${R}`, color: R, borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >ออกจากระบบ (Logout)</button>
              </div>
            )}
          </GlassCard>
        )}

      </div>
    </div>
  );
    }
