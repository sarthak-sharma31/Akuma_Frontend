import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.top}>
        <div style={s.logo}>
          <span style={s.red}>AKUMA</span>
          <span style={s.white}>FITS</span>
          <span style={s.jp}>悪魔</span>
        </div>
        <p style={s.tagline}>Wear Your Dark Side</p>
        <div style={s.links}>
          {[
            { to: "/", label: "Home" },
            { to: "/shop", label: "Shop" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((l) => (
            <Link key={l.to} to={l.to} style={s.link}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={s.bottom}>
        <span style={s.copy}>© 2026 AkumaFits. All rights reserved.</span>
        <div style={s.legal}>
          <Link to="/privacy-policy" style={s.legalLink}>Privacy Policy</Link>
          <Link to="/returns-exchange" style={s.legalLink}>Returns & Exchange</Link>
          <Link to="/shipping-info" style={s.legalLink}>Shipping Info</Link>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: "#040404", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "3rem 2rem 2rem", position: "relative", zIndex: 1 },
  top: { maxWidth: 1200, margin: "0 auto 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" },
  logo: { display: "flex", alignItems: "baseline", gap: "0.15rem" },
  red: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#ff2d2d", letterSpacing: "0.08em" },
  white: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", color: "#f0f0f0", letterSpacing: "0.08em" },
  jp: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "0.85rem", color: "#ff2d2d", marginLeft: "0.4rem", opacity: 0.7 },
  tagline: { color: "#444", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" },
  links: { display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" },
  link: { color: "#555", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", transition: "color 0.2s" },
  bottom: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", flexWrap: "wrap", gap: "1rem" },
  copy: { color: "#333", fontSize: "0.6rem" },
  legal: { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  legalLink: { color: "#444", fontSize: "0.6rem", letterSpacing: "0.1em" },
};