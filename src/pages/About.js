import { Link } from "react-router-dom";
import { FiTruck } from "react-icons/fi";
import { RiSkullLine } from "react-icons/ri";
import { TbShirt } from "react-icons/tb";
import { MdOutlineDiamond } from "react-icons/md";
import { useWindowSize } from "../hooks/useWindowSize";

export default function About() {
  const { isMobile, isTablet } = useWindowSize();

  return (
    <div className="page-wrapper">
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>Our Story</div>
          <h1 style={s.title}>
            BORN FROM<br /><span style={{ color: "#ff2d2d" }}>DARKNESS</span>
          </h1>
          <p style={s.sub}>A brand for those who chose the villain arc.</p>
        </div>
      </div>

      <div className="section">
        <div style={{ ...s.grid, flexDirection: isTablet ? "column" : "row", gap: isTablet ? "2.5rem" : "5rem" }}>
          <div style={{ ...s.graphicWrap, flex: isTablet ? "none" : "0 0 45%", maxWidth: isTablet ? 480 : "none", margin: isTablet ? "0 auto" : 0, width: "100%" }}>
            <style>{`
              @keyframes graphicPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
              @keyframes graphicFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
              @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Outer border frame */}
            <div style={s.graphicFrame}>

              {/* Background grid lines */}
              <div style={s.gridLines}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ ...s.gridLine, top: `${(i + 1) * 14}%` }} />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ ...s.gridLineV, left: `${(i + 1) * 20}%` }} />
                ))}
              </div>

              {/* Center kanji */}
              <div style={s.centerKanji}>悪魔</div>

              {/* Rotating ring */}
              <div style={s.ring} />

              {/* Corner marks */}
              {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                <div key={pos} style={{
                  ...s.corner,
                  top: pos.includes("top") ? 16 : "auto",
                  bottom: pos.includes("bottom") ? 16 : "auto",
                  left: pos.includes("left") ? 16 : "auto",
                  right: pos.includes("right") ? 16 : "auto",
                  borderTop: pos.includes("top") ? "2px solid #ff2d2d" : "none",
                  borderBottom: pos.includes("bottom") ? "2px solid #ff2d2d" : "none",
                  borderLeft: pos.includes("left") ? "2px solid #ff2d2d" : "none",
                  borderRight: pos.includes("right") ? "2px solid #ff2d2d" : "none",
                }} />
              ))}

              {/* Floating pills */}
              <div style={{ ...s.pill, top: "12%", left: "8%", animation: "graphicFloat 3s ease-in-out infinite" }}>ANIME</div>
              <div style={{ ...s.pill, top: "12%", right: "8%", animation: "graphicFloat 3.5s ease-in-out infinite" }}>INDIA</div>
              <div style={{ ...s.pill, bottom: "12%", left: "8%", animation: "graphicFloat 4s ease-in-out infinite" }}>240GSM</div>
              <div style={{ ...s.pill, bottom: "12%", right: "8%", animation: "graphicFloat 2.8s ease-in-out infinite" }}>VILLAIN</div>

              {/* Center text */}
              <div style={s.centerText}>
                <div style={s.centerBrand}>AKUMA<span style={{ color: "#ff2d2d" }}>FITS</span></div>
                <div style={s.centerSub}>WEAR YOUR DARK SIDE</div>
              </div>

              {/* Red glow */}
              <div style={s.glow} />
            </div>
          </div>
          <div style={s.content}>
            <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Who We Are</div>
            <h2 style={s.heading}>AKUMAFITS</h2>
            <p style={s.text}>
              AkumaFits was born from a simple idea — anime fans deserve streetwear that actually represents their energy. Not mass-produced merch, not unlicensed knockoffs. Just clean, premium, anime-inspired pieces built for those walking the villain arc.
            </p>
            <p style={s.text}>
              Based in India. Made for the 20s generation. Every piece is designed with intention — heavy cotton, oversized silhouettes, and artwork that speaks to the culture.
            </p>
            <Link to="/shop" className="btn-primary" style={{ display: "inline-block", marginTop: "2rem" }}>
              SHOP THE COLLECTION
            </Link>
          </div>
        </div>

        {/* Values */}
        <div style={s.values}>
          {[
            { icon: <MdOutlineDiamond size={28} color="#ff2d2d" />, title: "QUALITY FIRST", desc: "Every tee is 240gsm+ cotton. We don't compromise on fabric." },
            { icon: <TbShirt size={28} color="#ff2d2d" />, title: "ANIME SOUL", desc: "Inspired by the culture, not copying it. Original designs only." },
            { icon: <RiSkullLine size={28} color="#ff2d2d" />, title: "VILLAIN ENERGY", desc: "Made for those who embraced their dark side and owned it." },
            { icon: <FiTruck size={28} color="#ff2d2d" />, title: "INDIA FIRST", desc: "Free shipping pan-India. Fast delivery. Easy exchange policy." },
          ].map((v) => (
            <div key={v.title} style={s.valueCard}>
              <div style={s.valueIcon}>{v.icon}</div>
              <h3 style={s.valueTitle}>{v.title}</h3>
              <p style={s.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: { background: "linear-gradient(180deg, rgba(255,45,45,0.07) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,45,45,0.12)", padding: "5rem 1.5rem 4rem", textAlign: "center" },
  heroInner: { maxWidth: 1200, margin: "0 auto" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 8vw, 7rem)", letterSpacing: "0.04em", lineHeight: 0.95, marginBottom: "1rem" },
  sub: { color: "#666", fontSize: "0.8rem", letterSpacing: "0.2em" },
  grid: { display: "flex", alignItems: "center", flexWrap: "wrap", marginBottom: "5rem" },
  graphicWrap: { position: "relative" },
  graphicFrame: { width: "100%", aspectRatio: "3/4", background: "#080808", border: "1px solid rgba(255,45,45,0.2)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  gridLines: { position: "absolute", inset: 0, pointerEvents: "none" },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, background: "rgba(255,45,45,0.06)" },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, background: "rgba(255,45,45,0.06)" },
  centerKanji: { position: "absolute", fontFamily: "'Noto Sans JP', sans-serif", fontSize: "clamp(8rem, 18vw, 14rem)", color: "#ff2d2d", opacity: 0.05, lineHeight: 1, userSelect: "none", pointerEvents: "none" },
  ring: { position: "absolute", width: "55%", aspectRatio: "1", border: "1px solid rgba(255,45,45,0.15)", borderRadius: "50%", animation: "rotateSlow 20s linear infinite", borderTopColor: "rgba(255,45,45,0.5)" },
  corner: { position: "absolute", width: 24, height: 24 },
  pill: { position: "absolute", background: "rgba(255,45,45,0.08)", border: "1px solid rgba(255,45,45,0.2)", color: "#ff2d2d", fontSize: "0.5rem", letterSpacing: "0.2em", fontWeight: 700, padding: "0.3rem 0.6rem" },
  centerText: { position: "relative", textAlign: "center", zIndex: 2 },
  centerBrand: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "0.1em", lineHeight: 1, marginBottom: "0.4rem" },
  centerSub: { fontSize: "0.5rem", letterSpacing: "0.3em", color: "#555" },
  glow: { position: "absolute", bottom: "-30%", left: "50%", transform: "translateX(-50%)", width: "60%", aspectRatio: "1", background: "radial-gradient(circle, rgba(255,45,45,0.12) 0%, transparent 70%)", pointerEvents: "none", animation: "graphicPulse 4s ease-in-out infinite" },
  content: { flex: 1, minWidth: 260 },
  heading: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "0.05em", marginBottom: "1.5rem" },
  text: { color: "#888", fontSize: "0.78rem", lineHeight: 1.9, marginBottom: "1rem" },
  values: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem", marginTop: "2rem" },
  valueCard: { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", padding: "1.75rem 1.5rem", transition: "border-color 0.2s" },
  valueIcon: { marginBottom: "1rem" },
  valueTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", marginBottom: "0.6rem", color: "#ff2d2d" },
  valueDesc: { color: "#666", fontSize: "0.72rem", lineHeight: 1.8 },
};