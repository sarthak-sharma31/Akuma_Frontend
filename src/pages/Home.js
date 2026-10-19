import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowDown } from "react-icons/fi";
import { GiFlame } from "react-icons/gi";
import { TbDiamond } from "react-icons/tb";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";
import { useWindowSize } from "../hooks/useWindowSize";

export default function Home() {
  const { isMobile, isTablet } = useWindowSize();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    getProducts({ featured: "true" }).then((d) => {
      if (d.success) setFeatured(d.products.slice(0, 4));
      setLoading(false);
    });
  }, []);

  // Auto-cycle every 5 seconds
  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setHeroIdx((i) => (i + 1) % featured.length);
        setFading(false);
      }, 400); // fade out, swap, fade in
    }, 5000);
    return () => clearInterval(interval);
  }, [featured]);

  const heroProduct = featured[heroIdx];

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes heroFadeIn { from { opacity: 0; transform: scale(1.03); } to { opacity: 1; transform: scale(1); } }
        .hero-img-fade { animation: heroFadeIn 0.4s ease forwards; }
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .skeleton { background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%); background-size: 600px 100%; animation: shimmer 1.6s infinite; border-radius: 2px; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ ...s.hero, flexDirection: isTablet ? "column" : "row", padding: isMobile ? "6rem 1.25rem 3rem" : "8rem 2rem 4rem", gap: isTablet ? "2.5rem" : "4rem", minHeight: isTablet ? "auto" : "100vh" }}>
        <div style={{ ...s.heroContent, textAlign: isMobile ? "center" : "left" }} className="fade-up">
          <div className="eyebrow">— Anime Streetwear — India</div>
          <h1 style={s.heroTitle}>
            <span style={s.line1}>WEAR YOUR</span>
            <span style={s.line2}>DARK<span style={{ color: "#ff2d2d" }}> SIDE</span></span>
          </h1>
          <p style={s.heroSub}>Premium oversized anime tees &amp; hoodies for those who walk the villain arc. Crafted for the 20s crowd.</p>
          <div style={{ ...s.heroCtas, justifyContent: isMobile ? "center" : "flex-start" }}>
            <Link to="/shop" className="btn-primary">SHOP NOW</Link>
            <Link to="/shop" className="btn-outline">NEW DROPS</Link>
          </div>
          <div style={{ ...s.stats, justifyContent: isMobile ? "center" : "flex-start" }}>
            {[["500+", "Orders"], ["240gsm", "Cotton"], ["Free", "Shipping"], ["Easy", "Exchange"]].map(([val, lbl]) => (
              <div key={lbl} style={s.stat}>
                <span style={s.statVal}>{val}</span>
                <span style={s.statLbl}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {!isMobile && (loading || heroProduct) && (
          <div style={{ ...s.heroRight, flex: isTablet ? "none" : 1, width: isTablet ? "100%" : "auto", maxWidth: isTablet ? 380 : "none", margin: isTablet ? "0 auto" : 0 }}>
            {loading ? (
              <div style={s.heroImgWrap}>
                <div className="skeleton" style={{ width: "100%", aspectRatio: "3/4" }} />
                <div className="skeleton" style={{ position: "absolute", top: 20, left: -20, width: 100, height: 28 }} />
                <div className="skeleton" style={{ position: "absolute", bottom: 30, right: -20, width: 80, height: 44 }} />
              </div>
            ) : heroProduct ? (
              <Link to={`/product/${heroProduct._id}`} style={{ textDecoration: "none" }}>
                <div style={s.heroImgWrap}>
                  <img
                    key={heroIdx}
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    style={{ ...s.heroImg, opacity: fading ? 0 : 1, transition: "opacity 0.4s ease" }}
                    className={!fading ? "hero-img-fade" : ""}
                  />
                  <div style={s.heroImgOverlay} />
                  <div style={{ ...s.floatTag, opacity: fading ? 0 : 1, transition: "opacity 0.4s ease" }}>
                    {heroProduct.tag || "NEW DROP"} <GiFlame size={13} style={{ verticalAlign: "middle" }} />
                  </div>
                  <div style={{ ...s.floatPrice, opacity: fading ? 0 : 1, transition: "opacity 0.4s ease" }}>
                    ₹{heroProduct.price}
                  </div>
                  {featured.length > 1 && (
                    <div style={s.dotRow}>
                      {featured.map((_, i) => (
                        <button key={i}
                          onClick={(e) => { e.preventDefault(); setFading(true); setTimeout(() => { setHeroIdx(i); setFading(false); }, 400); }}
                          style={{ ...s.dot, background: i === heroIdx ? "#ff2d2d" : "rgba(255,255,255,0.25)", transform: i === heroIdx ? "scale(1.3)" : "scale(1)" }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ) : null}
          </div>
        )}

        {!isTablet && <div style={s.scrollHint}>SCROLL <FiArrowDown size={11} style={{ verticalAlign: "middle" }} /></div>}
      </section>

      <Marquee />

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section">
        <div style={s.secHeader}>
          <div style={s.secTitleRow}>
            <span style={s.kanji}>注目</span>
            <h2 style={s.secTitle}>FEATURED DROPS</h2>
          </div>
          <Link to="/shop" className="btn-outline" style={{ padding: "0.5rem 1.2rem", fontSize: "0.65rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            VIEW ALL <FiArrowRight size={13} />
          </Link>
        </div>
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="skeleton" style={{ width: "100%", aspectRatio: "3/4", marginBottom: "0.75rem" }} />
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: "0.5rem" }} />
                <div className="skeleton" style={{ height: 14, width: "40%" }} />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#555", fontSize: "0.75rem" }}>
            No featured products yet — add some from the admin panel!
          </div>
        )}
      </section>

      {/* ── BRAND STRIP ── */}
      <section style={s.brandStrip}>
        <div style={{ ...s.brandInner, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left", gap: isMobile ? "2rem" : "4rem" }}>
          {!isMobile && <div style={s.brandKanji}>悪魔の服</div>}
          <div style={s.brandMsg}>
            <h3 style={s.brandMsgTitle}>CRAFTED FOR THE VILLAIN ARC</h3>
            <p style={s.brandMsgText}>Every piece is made for those who've chosen their dark path. Heavy cotton, anime soul, villain energy.</p>
            <Link to="/about" style={{ color: "#ff2d2d", fontSize: "0.65rem", letterSpacing: "0.2em", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              OUR STORY <FiArrowRight size={12} />
            </Link>
          </div>
          <div style={{ ...s.brandFeatures, alignItems: isMobile ? "center" : "flex-start" }}>
            {["240gsm Cotton", "Oversized Fit", "Free Pan-India Shipping", "Easy Exchange Policy"].map((f) => (
              <div key={f} style={s.feature}>
                <TbDiamond size={12} color="#ff2d2d" style={{ flexShrink: 0 }} /> {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div className="section" style={{ textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>Limited Drops Every Week</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "0.04em", marginBottom: "1.5rem", lineHeight: 1 }}>
            DON'T MISS THE NEXT DROP
          </h2>
          <p style={{ color: "#888", fontSize: "0.75rem", maxWidth: 440, margin: "0 auto 2rem", lineHeight: 1.8 }}>
            Follow us on Instagram @Akuma_Fits for early access, new drops, and villain arc content.
          </p>
          <Link to="/shop" className="btn-primary">SHOP THE COLLECTION</Link>
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { display: "flex", alignItems: "center", maxWidth: 1200, margin: "0 auto", position: "relative" },
  heroContent: { flex: 1 },
  heroTitle: { fontFamily: "'Bebas Neue', sans-serif", lineHeight: 0.88, margin: "1.2rem 0 1.5rem" },
  line1: { display: "block", fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)", letterSpacing: "0.05em" },
  line2: { display: "block", fontSize: "clamp(3.5rem, 9.5vw, 8rem)", letterSpacing: "0.02em" },
  heroSub: { color: "#888", fontSize: "0.78rem", lineHeight: 1.8, maxWidth: 420, marginBottom: "2.5rem" },
  heroCtas: { display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" },
  stats: { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  stat: { display: "flex", flexDirection: "column" },
  statVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#ff2d2d", lineHeight: 1 },
  statLbl: { fontSize: "0.55rem", letterSpacing: "0.22em", color: "#555", marginTop: "0.2rem", textTransform: "uppercase" },
  heroRight: { display: "flex", justifyContent: "center", animation: "float 4s ease-in-out infinite" },
  heroImgWrap: { position: "relative", maxWidth: 420, width: "100%" },
  heroImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover" },
  heroImgOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(8,8,8,0.75) 100%)", pointerEvents: "none" },
  floatTag: { position: "absolute", top: 20, left: -20, background: "#ff2d2d", color: "#fff", padding: "0.4rem 0.9rem", fontSize: "0.65rem", letterSpacing: "0.15em", fontWeight: 700 },
  floatPrice: { position: "absolute", bottom: 30, right: -20, background: "#080808", border: "1px solid #ff2d2d", color: "#ff2d2d", padding: "0.6rem 1.2rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.1em" },
  dotRow: { position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.4rem", zIndex: 10 },
  dot: { width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" },
  scrollHint: { position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", fontSize: "0.58rem", letterSpacing: "0.3em", color: "#3a3a3a", animation: "pulse 2.5s infinite" },
  secHeader: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" },
  secTitleRow: { display: "flex", alignItems: "baseline", gap: "1rem" },
  kanji: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "1.1rem", color: "#ff2d2d", opacity: 0.55 },
  secTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "0.05em" },
  brandStrip: { background: "#0d0000", borderTop: "1px solid rgba(255,45,45,0.18)", borderBottom: "1px solid rgba(255,45,45,0.18)", padding: "4rem 2rem" },
  brandInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", flexWrap: "wrap" },
  brandKanji: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "4.5rem", color: "#ff2d2d", opacity: 0.25, lineHeight: 1, flexShrink: 0 },
  brandMsg: { flex: 1, minWidth: 220 },
  brandMsgTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.05em", marginBottom: "0.6rem" },
  brandMsgText: { color: "#666", fontSize: "0.75rem", lineHeight: 1.8, marginBottom: "1rem" },
  brandFeatures: { display: "flex", flexDirection: "column", gap: "0.7rem", minWidth: 200 },
  feature: { fontSize: "0.68rem", letterSpacing: "0.1em", color: "#aaa", display: "flex", alignItems: "center", gap: "0.5rem" },
  cta: { background: "linear-gradient(180deg, rgba(255,45,45,0.04) 0%, transparent 100%)", borderTop: "1px solid rgba(255,255,255,0.04)" },
};