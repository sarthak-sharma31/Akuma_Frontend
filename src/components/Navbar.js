import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useWindowSize } from "../hooks/useWindowSize";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/track-order", label: "Track Order" },
];

export default function Navbar() {
  const { totalItems, setCartOpen } = useCart();
  const { pathname } = useLocation();
  const { isMobile, isTablet } = useWindowSize();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav style={s.nav}>
        <div style={s.inner}>
          <Link to="/" style={s.logo} onClick={closeMenu}>
            <span style={s.logoRed}>AKUMA</span>
            <span style={s.logoWhite}>FITS</span>
            {!isMobile && <span style={s.logoJp}>悪魔</span>}
          </Link>

          {!isTablet && (
            <div style={s.links}>
              {links.map((l) => (
                <Link key={l.to} to={l.to}
                  style={{ ...s.link, ...(pathname === l.to ? s.linkActive : {}) }}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          <div style={s.right}>
            <button style={s.cartBtn} onClick={() => { setCartOpen(true); closeMenu(); }}>
              <FiShoppingCart size={17} />
              {!isMobile && <span style={s.cartLabel}>CART</span>}
              {totalItems > 0 && <span style={s.badge}>{totalItems}</span>}
            </button>
            {isTablet && (
              <button style={s.hamburger} onClick={() => setMenuOpen((p) => !p)}>
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {isTablet && menuOpen && (
        <div style={s.mobileMenu}>
          <div style={s.mobileMenuInner}>
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                style={{ ...s.mobileLink, ...(pathname === l.to ? s.mobileLinkActive : {}) }}
                onClick={closeMenu}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: "rgba(8,8,8,0.96)", backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,45,45,0.15)", height: 64,
  },
  inner: {
    maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem",
    height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "baseline", gap: "0.15rem", flexShrink: 0 },
  logoRed:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#ff2d2d", letterSpacing: "0.08em" },
  logoWhite: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#f0f0f0", letterSpacing: "0.08em" },
  logoJp:    { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "0.75rem", color: "#ff2d2d", marginLeft: "0.4rem", opacity: 0.8 },
  links: { display: "flex", gap: "2rem" },
  link: { color: "#888", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.2s" },
  linkActive: { color: "#ff2d2d" },
  right: { display: "flex", alignItems: "center", gap: "0.75rem" },
  cartBtn: {
    background: "none", border: "1px solid rgba(255,45,45,0.35)",
    borderRadius: 3, padding: "0.4rem 0.75rem", color: "#f0f0f0",
    fontSize: "0.65rem", letterSpacing: "0.15em",
    display: "flex", alignItems: "center", gap: "0.45rem", position: "relative",
    transition: "border-color 0.2s", cursor: "pointer",
  },
  cartLabel: { display: "inline" },
  badge: {
    background: "#ff2d2d", color: "#fff", borderRadius: "50%",
    width: 18, height: 18, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "0.6rem", fontWeight: 700,
  },
  hamburger: {
    background: "none", border: "none", color: "#f0f0f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: "0.25rem",
  },
  mobileMenu: {
    position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
    background: "rgba(8,8,8,0.98)", borderBottom: "1px solid rgba(255,45,45,0.2)",
    backdropFilter: "blur(16px)", animation: "fadeUp 0.2s ease",
  },
  mobileMenuInner: {
    maxWidth: 1200, margin: "0 auto", padding: "1rem 1.5rem 1.5rem",
    display: "flex", flexDirection: "column",
  },
  mobileLink: {
    color: "#888", fontSize: "0.75rem", letterSpacing: "0.2em",
    textTransform: "uppercase", padding: "1rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "color 0.2s",
  },
  mobileLinkActive: { color: "#ff2d2d" },
};