import { useState, useEffect, useCallback } from "react";
import { RiSkullLine } from "react-icons/ri";
import { FiRefreshCw } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import Marquee from "../components/Marquee";
import { getProducts } from "../services/api";
import { useWindowSize } from "../hooks/useWindowSize";

const filters = ["All", "Tees", "Hoodies", "Joggers", "Accessories"];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("All");
  const [sort, setSort] = useState("default");
  const { isMobile } = useWindowSize();

  // useEffect(() => { fetchProducts(); }, [active]);

  // const fetchProducts = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const params = active !== "All" ? { category: active } : {};
  //     const data = await getProducts(params);
  //     if (data.success) setProducts(data.products);
  //     else setError("Failed to load products");
  //   } catch {
  //     setError("Could not connect to server");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  
const fetchProducts = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const params = active !== "All" ? { category: active } : {};
    const data = await getProducts(params);

    if (data.success) {
      setProducts(data.products);
    } else {
      setError("Failed to load products");
    }
  } catch {
    setError("Could not connect to server");
  } finally {
    setLoading(false);
  }
}, [active]);

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);


  let displayed = [...products];
  if (sort === "price-asc")  displayed.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") displayed.sort((a, b) => b.price - a.price);
  if (sort === "discount")   displayed.sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice);

  return (
    <div className="page-wrapper">
      <div style={s.pageHeader}>
        <div style={s.pageHeaderInner}>
          <span style={s.kanji}>商品</span>
          <h1 style={s.pageTitle}>THE COLLECTION</h1>
          <p style={s.pageSub}>Anime streetwear for the villain arc generation</p>
        </div>
      </div>

      <Marquee />

      <div className="section">
        <div style={{ ...s.toolbar, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center" }}>
          <div style={s.filters}>
            {filters.map((f) => (
              <button key={f} style={{ ...s.filterBtn, ...(active === f ? s.filterActive : {}) }} onClick={() => setActive(f)}>
                {f}
              </button>
            ))}
          </div>
          <div style={s.sortWrap}>
            <label style={s.sortLabel}>SORT:</label>
            <select style={s.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={s.stateBox}>
            <FiRefreshCw size={32} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
            <p style={s.stateText}>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div style={s.stateBox}>
            <RiSkullLine size={48} color="#ff2d2d" style={{ opacity: 0.4 }} />
            <p style={s.stateText}>{error}</p>
            <button className="btn-outline" style={{ marginTop: "1rem" }} onClick={fetchProducts}>TRY AGAIN</button>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div style={s.stateBox}>
            <RiSkullLine size={48} color="#ff2d2d" style={{ opacity: 0.4 }} />
            <p style={s.stateText}>No products here yet.</p>
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <div className="product-grid">
            {displayed.map((p, i) => (
              <div key={p._id} className="fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  pageHeader: { background: "linear-gradient(180deg, rgba(255,45,45,0.07) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,45,45,0.12)", padding: "5rem 1.5rem 3rem", textAlign: "center" },
  pageHeaderInner: { maxWidth: 1200, margin: "0 auto" },
  kanji: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "1rem", color: "#ff2d2d", opacity: 0.5, display: "block", marginBottom: "0.5rem" },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "0.05em", marginBottom: "0.5rem" },
  pageSub: { color: "#666", fontSize: "0.75rem", letterSpacing: "0.15em" },
  toolbar: { display: "flex", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" },
  filters: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  filterBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#888", padding: "0.45rem 1.1rem", fontSize: "0.65rem", letterSpacing: "0.15em", cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s", textTransform: "uppercase" },
  filterActive: { background: "#ff2d2d", border: "1px solid #ff2d2d", color: "#fff" },
  sortWrap: { display: "flex", alignItems: "center", gap: "0.7rem" },
  sortLabel: { fontSize: "0.6rem", letterSpacing: "0.2em", color: "#555" },
  sortSelect: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f0f0", padding: "0.4rem 0.8rem", fontSize: "0.65rem", fontFamily: "'Space Mono', monospace", cursor: "pointer", outline: "none" },
  stateBox: { textAlign: "center", padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" },
  stateText: { color: "#666", fontSize: "0.75rem" },
};
