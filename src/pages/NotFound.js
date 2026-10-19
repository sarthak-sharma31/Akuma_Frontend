import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="page-wrapper" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <style>{`
        @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      <div>
        {/* Big glitchy 404 */}
        <div style={s.code}>
          <span style={{ color: "#ff2d2d" }}>4</span>
          <span style={{ color: "#f0f0f0", animation: "flicker 2s ease-in-out infinite" }}>0</span>
          <span style={{ color: "#ff2d2d" }}>4</span>
        </div>

        {/* Kanji */}
        <div style={s.kanji}>見つかりません</div>

        <h1 style={s.title}>LOST IN THE VOID</h1>
        <p style={s.sub}>This page doesn't exist — or maybe it chose the villain arc and disappeared.</p>

        <div style={s.actions}>
          <Link to="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            GO HOME <FiArrowRight size={14} />
          </Link>
          <Link to="/shop" className="btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            SHOP <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  code: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(8rem, 20vw, 14rem)", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "0.5rem" },
  kanji: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "0.85rem", color: "#ff2d2d", opacity: 0.5, letterSpacing: "0.2em", marginBottom: "1.5rem" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "0.05em", marginBottom: "1rem" },
  sub: { color: "#666", fontSize: "0.75rem", lineHeight: 1.8, maxWidth: 380, margin: "0 auto 2.5rem" },
  actions: { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" },
};