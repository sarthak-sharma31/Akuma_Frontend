import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowRight, FiTruck, FiRefreshCw, FiCheckCircle, FiTag, FiCheck, FiChevronLeft, FiChevronRight, FiX, FiStar, FiCamera } from "react-icons/fi";
import { TbDiamond, TbRuler } from "react-icons/tb";
import { useCart } from "../context/CartContext";
import { useWindowSize } from "../hooks/useWindowSize";
import { getProduct, getProducts, getReviews, submitReview, uploadToCloudinary } from "../services/api";

const tagColors = { BESTSELLER: "#ff2d2d", "NEW DROP": "#ff6b00", HOT: "#ff2d2d", LIMITED: "#9b30ff", SALE: "#00cc66" };

const SIZE_CHART = [
  { size: "S",   chest: "36–38", shoulder: "16–17",   length: "27–28" },
  { size: "M",   chest: "38–40", shoulder: "17–17.5", length: "28–29" },
  { size: "L",   chest: "42–44", shoulder: "18–18.5", length: "29–30" },
  { size: "XL",  chest: "44–46", shoulder: "18.5–19", length: "30–31" },
  { size: "XXL", chest: "48–50", shoulder: "19–20",   length: "31–32" },
];

function SizeChartModal({ onClose }) {
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        <div style={m.header}>
          <h2 style={m.title}>SIZE CHART</h2>
          <button style={m.closeBtn} onClick={onClose}><FiX size={18} /></button>
        </div>

        {/* How to measure */}
        <div style={m.measureRow}>
          {[
            { label: "CHEST", desc: "Measure around the fullest part of your chest, keeping tape horizontal." },
            { label: "SHOULDER", desc: "Measure from shoulder seam to shoulder seam across the back." },
            { label: "LENGTH", desc: "Measure from the highest point of the shoulder down to the hem." },
          ].map((item) => (
            <div key={item.label} style={m.measureCard}>
              <div style={m.measureLabel}>{item.label}</div>
              <div style={m.measureDesc}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={m.table}>
            <thead>
              <tr>
                {["SIZE", "CHEST (in)", "SHOULDER (in)", "LENGTH (in)"].map((h) => (
                  <th key={h} style={m.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row, i) => (
                <tr key={row.size} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ ...m.td, color: "#ff2d2d", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em" }}>{row.size}</td>
                  <td style={m.td}>{row.chest}</td>
                  <td style={m.td}>{row.shoulder}</td>
                  <td style={m.td}>{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={m.note}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <TbDiamond size={11} color="#ff2d2d" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>These are <strong style={{ color: "#aaa" }}>body measurements</strong> in inches based on a universal relaxed fit reference. Actual garment dimensions may vary slightly between products depending on the supplier.</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <TbDiamond size={11} color="#ff2d2d" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Since AkumaFits are <strong style={{ color: "#aaa" }}>oversized</strong>, the garment will be larger than your body measurement. If you are between sizes, <strong style={{ color: "#aaa" }}>size down</strong>.</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <TbDiamond size={11} color="#ff2d2d" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Not sure? Measure a well-fitting T-shirt you already own and compare. Or DM us <strong style={{ color: "#ff2d2d" }}>@akuma_fits</strong> before ordering.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isMobile, isTablet } = useWindowSize();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [sizeChart, setSizeChart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ orderId: "", email: "", reviewerName: "", rating: 5, comment: "", images: [] });
  const [reviewImgs, setReviewImgs] = useState([]); // previews array
  const [uploadingIdx, setUploadingIdx] = useState(null); // which slot is uploading
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);

  const imgRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setSize("");
    setActiveIdx(0);
    getProduct(id).then((d) => {
      if (d.success) {
        setProduct(d.product);
        getProducts({ category: d.product.category }).then((r) => {
          if (r.success) setRelated(r.products.filter((p) => p._id !== id).slice(0, 3));
        });
        getReviews(id).then((r) => {
          if (r.success) setReviews(r.reviews);
        });
      }
      setLoading(false);
    });
    window.scrollTo(0, 0);
  }, [id]);

  const handleAdd = () => {
    if (!size || !product.inStock) return;
    addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleReviewImageChange = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setReviewImgs((prev) => { const a = [...prev]; a[idx] = preview; return a; });
    setUploadingIdx(idx);
    const result = await uploadToCloudinary(file);
    setUploadingIdx(null);
    if (result.success) {
      setReviewForm((p) => {
        const imgs = [...(p.images || [])];
        imgs[idx] = result.url;
        return { ...p, images: imgs };
      });
    } else {
      setReviewImgs((prev) => { const a = [...prev]; a[idx] = null; return a; });
      setReviewError("Image upload failed. Try again.");
    }
  };

  const removeReviewImg = (idx) => {
    setReviewImgs((prev) => { const a = [...prev]; a[idx] = null; return a; });
    setReviewForm((p) => { const imgs = [...(p.images || [])]; imgs[idx] = null; return { ...p, images: imgs }; });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError("");
    const cleanImages = (reviewForm.images || []).filter(Boolean);
    const data = await submitReview({ ...reviewForm, images: cleanImages, productId: product._id });
    setSubmittingReview(false);
    if (data.success) {
      setReviewSuccess(data.message);
      setReviewFormOpen(false);
      setReviewForm({ orderId: "", email: "", reviewerName: "", rating: 5, comment: "", images: [] });
      setReviewImgs([]);
    } else {
      setReviewError(data.error || "Failed to submit review.");
    }
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <FiRefreshCw size={36} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return (
    <div className="page-wrapper" style={{ textAlign: "center", padding: "8rem 2rem" }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", color: "#ff2d2d" }}>Product Not Found</h2>
      <Link to="/shop" className="btn-primary" style={{ display: "inline-block", marginTop: "2rem" }}>BACK TO SHOP</Link>
    </div>
  );

  const allImages = [product.image, ...(product.images || []).filter((img) => img && img !== product.image)];
  const hasMultiple = allImages.length > 1;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="page-wrapper">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {sizeChart && <SizeChartModal onClose={() => setSizeChart(false)} />}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: "1rem" }}
        >
          <img src={lightboxImg} alt="review" style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }} />
          <button onClick={() => setLightboxImg(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={s.crumb}>
        <div style={s.crumbInner}>
          <Link to="/" style={s.crumbLink}>Home</Link>
          <span style={s.crumbSep}>/</span>
          <Link to="/shop" style={s.crumbLink}>Shop</Link>
          <span style={s.crumbSep}>/</span>
          <span style={{ ...s.crumbCurrent, maxWidth: isMobile ? 140 : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block", verticalAlign: "middle" }}>
            {product.name}
          </span>
        </div>
      </div>

      <div className="section">
        <div style={{ ...s.layout, flexDirection: isTablet ? "column" : "row", gap: isTablet ? "2rem" : "4rem" }}>

          {/* ── IMAGE GALLERY ── */}
          <div style={{ flex: isTablet ? "none" : "0 0 50%", width: "100%", maxWidth: isTablet ? 520 : "none", margin: isTablet ? "0 auto" : 0 }}>
            <div style={{ position: "relative" }}>
              <div
                ref={imgRef}
                style={{ position: "relative", overflow: "hidden", background: "#111", cursor: zoomed ? "zoom-out" : "zoom-in" }}
                onClick={() => setZoomed(!zoomed)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomed(false)}
              >
                <img
                  src={allImages[activeIdx]}
                  alt={product.name}
                  style={{
                    width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: zoomed ? "scale(2.2)" : "scale(1)",
                    transition: zoomed ? "transform 0.1s ease" : "transform 0.3s ease",
                  }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none", opacity: zoomed ? 0 : 1, transition: "opacity 0.2s" }} />

                {product.tag && !zoomed && (
                  <span style={{ position: "absolute", top: 16, left: 16, color: "#fff", fontSize: "0.6rem", letterSpacing: "0.15em", fontWeight: 700, padding: "0.3rem 0.7rem", background: tagColors[product.tag] || "#ff2d2d" }}>
                    {product.tag}
                  </span>
                )}
                {!product.inStock && !zoomed && (
                  <div style={s.outOfStockBanner}>OUT OF STOCK</div>
                )}
                {hasMultiple && (
                  <>
                    <button style={{ ...s.arrowBtn, left: 10, opacity: activeIdx === 0 ? 0.2 : 1 }} onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => Math.max(0, i - 1)); }}>
                      <FiChevronLeft size={18} />
                    </button>
                    <button style={{ ...s.arrowBtn, right: 10, opacity: activeIdx === allImages.length - 1 ? 0.2 : 1 }} onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => Math.min(allImages.length - 1, i + 1)); }}>
                      <FiChevronRight size={18} />
                    </button>
                  </>
                )}
                {!zoomed && !isMobile && <div style={s.zoomHint}>🔍 HOVER TO ZOOM</div>}
                {hasMultiple && <div style={s.counter}>{activeIdx + 1} / {allImages.length}</div>}
              </div>
            </div>

            {hasMultiple && (
              <div style={s.thumbStrip}>
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} style={{ ...s.thumbBtn, borderColor: activeIdx === i ? "#ff2d2d" : "rgba(255,255,255,0.08)" }}>
                    <img src={img} alt={`view ${i + 1}`} style={s.thumbImg} />
                    {activeIdx === i && <div style={s.thumbActive} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PRODUCT INFO ── */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: "0.5rem" }}>
            <div style={s.categoryBadge}>{product.category.toUpperCase()}</div>
            <h1 style={s.title}>{product.name}</h1>
            <div style={s.pricing}>
              <span style={s.price}>₹{product.price}</span>
              <span style={s.original}>₹{product.originalPrice}</span>
              <span style={s.discountBadge}>{discount}% OFF</span>
            </div>
            <p style={s.desc}>{product.description}</p>

            <div style={s.sizeSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <div style={s.sizeLabel}>
                  SELECT SIZE <span style={s.sizeTip}> — Oversized fit. Free size fits M–XL.</span>
                </div>
                <button style={s.sizeChartBtn} onClick={() => setSizeChart(true)}>
                  <TbRuler size={13} /> SIZE CHART
                </button>
              </div>
              <div style={s.sizeGrid}>
                {product.sizes.map((sz) => (
                  <button key={sz} className={`size-btn${size === sz ? " active" : ""}`} onClick={() => setSize(sz)} disabled={!product.inStock}>
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", textAlign: "center", opacity: (size && product.inStock) ? 1 : 0.45, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              onClick={handleAdd}
              disabled={!size || !product.inStock}
            >
              {!product.inStock ? "OUT OF STOCK"
                : added ? <><FiCheck size={14} /> ADDED TO CART</>
                : size ? `ADD TO CART — ₹${product.price}`
                : "SELECT A SIZE FIRST"}
            </button>

            {/* Trust badges — removed COD, added Razorpay */}
            <div style={{ ...s.trust, flexDirection: isMobile ? "column" : "row" }}>
              {[
                { icon: <FiTruck size={13} />,       text: "Free Pan-India Shipping" },
                { icon: <FiRefreshCw size={13} />,   text: "Easy Size Exchange" },
                { icon: <FiCheckCircle size={13} />, text: "Secured by Razorpay" },
                { icon: <FiTag size={13} />,         text: "100% Authentic" },
              ].map((t) => (
                <span key={t.text} style={s.trustItem}>{t.icon} {t.text}</span>
              ))}
            </div>


            <div style={s.details}>
              <h4 style={s.detailsTitle}>PRODUCT DETAILS</h4>
              <ul style={s.detailsList}>
                {["Premium 240gsm cotton", "Oversized / boxy fit", "Screen printed artwork", "Machine washable", "Made in India"].map((d) => (
                  <li key={d} style={s.detailItem}>
                    <TbDiamond size={11} color="#ff2d2d" style={{ flexShrink: 0, marginTop: 2 }} /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: "5rem" }}>
            <div style={s.relatedHeader}>
              <h2 style={s.relatedTitle}>YOU MIGHT ALSO LIKE</h2>
              <Link to="/shop" style={{ color: "#ff2d2d", fontSize: "0.65rem", letterSpacing: "0.2em", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                VIEW ALL <FiArrowRight size={12} />
              </Link>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="product-img-wrap">
                    <img src={p.image} alt={p.name} className="product-img" />
                    <div className="product-img-overlay" />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-pricing">
                      <span className="product-price">₹{p.price}</span>
                      <span className="product-original">₹{p.originalPrice}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {(
          <div style={s.reviewsSection}>
            <div style={s.reviewsHeader}>
              <div>
                <h2 style={s.reviewsTitle}>CUSTOMER REVIEWS</h2>
                {reviews.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map((star) => (
                        <FiStar key={star} size={13}
                          color={star <= Math.round(reviews.reduce((a,r) => a + r.rating, 0) / reviews.length) ? "#ff2d2d" : "#333"}
                          fill={star <= Math.round(reviews.reduce((a,r) => a + r.rating, 0) / reviews.length) ? "#ff2d2d" : "none"}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#666" }}>
                      {(reviews.reduce((a,r) => a + r.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <button
                style={s.writeReviewBtn}
                onClick={() => { setReviewFormOpen(!reviewFormOpen); setReviewError(""); setReviewSuccess(""); }}
              >
                {reviewFormOpen ? "CANCEL" : "✍ WRITE A REVIEW"}
              </button>
            </div>

            {/* ── Write a Review form ── */}
            {reviewFormOpen && (
              <form onSubmit={handleSubmitReview} style={s.reviewForm}>
                <div style={{ fontSize: "0.55rem", letterSpacing: "0.25em", color: "#ff2d2d", marginBottom: "1rem" }}>
                  YOUR REVIEW
                </div>

                {/* Rating stars */}
                <div style={{ marginBottom: "1rem" }}>
                  <label className="form-label">RATING *</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                    {[1,2,3,4,5].map((star) => (
                      <FiStar
                        key={star}
                        size={24}
                        style={{ cursor: "pointer", transition: "color 0.15s" }}
                        color={star <= reviewForm.rating ? "#ff2d2d" : "#444"}
                        fill={star <= reviewForm.rating ? "#ff2d2d" : "none"}
                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 180, marginBottom: "1rem" }}>
                    <label className="form-label">YOUR NAME *</label>
                    <input className="form-input" required placeholder="e.g. Rahul S."
                      value={reviewForm.reviewerName}
                      onChange={(e) => setReviewForm((p) => ({ ...p, reviewerName: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180, marginBottom: "1rem" }}>
                    <label className="form-label">EMAIL *</label>
                    <input className="form-input" type="email" required placeholder="Email used to order"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="form-label">ORDER ID * <span style={{ color: "#444", fontWeight: 400 }}>(from your order confirmation)</span></label>
                  <input className="form-input" required placeholder="e.g. AK-MN17CAVW-O7W" style={{ letterSpacing: "0.1em" }}
                    value={reviewForm.orderId}
                    onChange={(e) => setReviewForm((p) => ({ ...p, orderId: e.target.value }))} />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="form-label">REVIEW <span style={{ color: "#444", fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-input" rows={3} placeholder="How does it fit? Quality? Would you recommend it?"
                    value={reviewForm.comment} style={{ resize: "none" }}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} />
                </div>

                {/* Image upload — up to 3 */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">PHOTOS <span style={{ color: "#444", fontWeight: 400 }}>(optional, up to 3)</span></label>
                  <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <label style={{ ...s.uploadLabel, borderColor: reviewImgs[idx] ? "rgba(255,45,45,0.4)" : "rgba(255,255,255,0.15)" }}>
                          <input type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => handleReviewImageChange(e, idx)} />
                          {reviewImgs[idx] ? (
                            <img src={reviewImgs[idx]} alt={`preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                              <FiCamera size={18} color={uploadingIdx === idx ? "#ff2d2d" : "#555"} />
                              <span style={{ fontSize: "0.5rem", color: uploadingIdx === idx ? "#ff2d2d" : "#555", letterSpacing: "0.08em", textAlign: "center" }}>
                                {uploadingIdx === idx ? "UPLOADING..." : `PHOTO ${idx + 1}`}
                              </span>
                            </div>
                          )}
                        </label>
                        {reviewImgs[idx] && (
                          <button type="button"
                            onClick={() => removeReviewImg(idx)}
                            style={{ position: "absolute", top: -6, right: -6, background: "#ff2d2d", border: "none", color: "#fff", width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
                            <FiX size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {reviewError && <p style={{ fontSize: "0.7rem", color: "#ff2d2d", marginBottom: "0.75rem" }}>{reviewError}</p>}

                <button type="submit" className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: submittingReview || uploadingIdx !== null ? 0.6 : 1 }}
                  disabled={submittingReview || uploadingIdx !== null}>
                  {submittingReview ? <FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiCheck size={14} />}
                  {submittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
                </button>
              </form>
            )}

            {/* Success message */}
            {reviewSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,204,102,0.06)", border: "1px solid rgba(0,204,102,0.2)", padding: "0.9rem 1rem", fontSize: "0.7rem", color: "#00cc66", marginBottom: "1.5rem" }}>
                <FiCheckCircle size={15} /> {reviewSuccess}
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 && !reviewFormOpen && (
              <p style={{ fontSize: "0.7rem", color: "#444", textAlign: "center", padding: "2rem 0" }}>
                No reviews yet — be the first to review this product!
              </p>
            )}

            <div style={s.reviewsList}>
              {reviews.map((review) => (
                <div key={review._id} style={s.reviewCard}>
                  <div style={s.reviewTop}>
                    <div>
                      <div style={s.reviewerName}>{review.reviewerName}</div>
                      {review.verified && <span style={s.verifiedBadge}>✓ Verified Purchase</span>}
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map((star) => (
                        <FiStar key={star} size={12}
                          color={star <= review.rating ? "#ff2d2d" : "#333"}
                          fill={star <= review.rating ? "#ff2d2d" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Show multiple images, fall back to single image for old reviews */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: (review.images?.length > 0 || review.image) ? "0.75rem" : 0 }}>
                    {((review.images && review.images.filter(Boolean).length > 0)
                      ? review.images.filter(Boolean)
                      : review.image ? [review.image] : []
                    ).map((img, i) => (
                      <img key={i} src={img} alt={"review " + (i + 1)}
                        style={{ ...s.reviewImg, marginBottom: 0, cursor: "zoom-in" }}
                        onClick={() => setLightboxImg(img)}
                        onError={(e) => e.target.style.display = "none"} />
                    ))}
                  </div>
                  {review.comment && <p style={s.reviewComment}>{review.comment}</p>}
                  <div style={s.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  crumb: { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0.8rem 1.5rem" },
  crumbInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" },
  crumbLink: { color: "#555", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" },
  crumbSep: { color: "#333", fontSize: "0.6rem" },
  crumbCurrent: { color: "#ff2d2d", fontSize: "0.6rem", letterSpacing: "0.1em" },
  layout: { display: "flex", flexWrap: "wrap" },
  outOfStockBanner: { position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.88)", color: "#888", textAlign: "center", padding: "1rem", fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: 700 },
  arrowBtn: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(8,8,8,0.75)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 5, backdropFilter: "blur(4px)", transition: "opacity 0.2s" },
  zoomHint: { position: "absolute", bottom: 12, right: 12, fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", pointerEvents: "none" },
  counter: { position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#aaa", fontSize: "0.55rem", letterSpacing: "0.15em", padding: "0.2rem 0.5rem", backdropFilter: "blur(4px)" },
  thumbStrip: { display: "flex", flexDirection: "row", gap: "0.5rem", marginTop: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" },
  thumbBtn: { background: "none", border: "2px solid", padding: 0, cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.2s", flexShrink: 0, width: 72 },
  thumbImg: { width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" },
  thumbActive: { position: "absolute", inset: 0, background: "rgba(255,45,45,0.15)" },
  categoryBadge: { fontSize: "0.55rem", letterSpacing: "0.28em", color: "#ff2d2d", marginBottom: "0.6rem" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: "1.2rem" },
  pricing: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  price: { fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" },
  original: { fontSize: "1rem", color: "#555", textDecoration: "line-through" },
  discountBadge: { fontSize: "0.7rem", color: "#00cc66", letterSpacing: "0.1em", fontWeight: 700, background: "rgba(0,204,102,0.08)", padding: "0.2rem 0.5rem" },
  desc: { color: "#888", fontSize: "0.78rem", lineHeight: 1.8, marginBottom: "2rem" },
  sizeSection: { marginBottom: "1.75rem" },
  sizeLabel: { fontSize: "0.6rem", letterSpacing: "0.2em", color: "#888", fontWeight: 700, textTransform: "uppercase" },
  sizeTip: { color: "#555", fontWeight: 400, letterSpacing: "0.05em" },
  sizeChartBtn: { background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "#888", fontSize: "0.55rem", letterSpacing: "0.15em", padding: "0.3rem 0.7rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 },
  sizeGrid: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  trust: { display: "flex", flexWrap: "wrap", margin: "1.2rem 0 2rem", gap: "0.6rem" },
  trustItem: { fontSize: "0.62rem", color: "#777", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.35rem" },
  details: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" },
  detailsTitle: { fontSize: "0.6rem", letterSpacing: "0.25em", color: "#555", marginBottom: "0.8rem" },
  detailsList: { listStyle: "none" },
  detailItem: { fontSize: "0.72rem", color: "#888", lineHeight: 2, display: "flex", gap: "0.5rem" },
  reviewsSection: { marginTop: "4rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2.5rem" },
  reviewsHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" },
  reviewsTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "0.05em" },
  writeReviewBtn: { background: "none", border: "1px solid rgba(255,45,45,0.4)", color: "#ff2d2d", padding: "0.5rem 1rem", fontSize: "0.6rem", letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" },
  reviewForm: { background: "#0a0a0a", border: "1px solid rgba(255,45,45,0.15)", padding: "1.5rem", marginBottom: "2rem" },
  uploadLabel: { display: "flex", alignItems: "center", justifyContent: "center", width: 100, height: 100, border: "1px dashed rgba(255,255,255,0.15)", cursor: "pointer", transition: "border-color 0.2s", marginTop: "0.5rem", overflow: "hidden" },
  reviewsList: { display: "flex", flexDirection: "column", gap: "1rem" },
  reviewCard: { background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem" },
  reviewTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  reviewerName: { fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" },
  verifiedBadge: { fontSize: "0.55rem", color: "#00cc66", letterSpacing: "0.1em" },
  reviewComment: { fontSize: "0.73rem", color: "#888", lineHeight: 1.8, marginTop: "0.5rem" },
  reviewImg: { width: 90, height: 90, objectFit: "cover", marginBottom: "0.75rem", display: "block" },
  reviewDate: { fontSize: "0.58rem", color: "#444", letterSpacing: "0.08em", marginTop: "0.5rem" },
  relatedHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
  relatedTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem, 4vw, 2rem)", letterSpacing: "0.05em" },
};

// Size chart modal styles
const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" },
  modal: { background: "#0f0f0f", border: "1px solid rgba(255,45,45,0.2)", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0f0f0f", zIndex: 10 },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em" },
  closeBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex" },
  measureRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  measureCard: { background: "#080808", border: "1px solid rgba(255,45,45,0.1)", padding: "0.9rem" },
  measureLabel: { fontSize: "0.55rem", letterSpacing: "0.2em", color: "#ff2d2d", fontWeight: 700, marginBottom: "0.4rem" },
  measureDesc: { fontSize: "0.62rem", color: "#666", lineHeight: 1.7 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 1.5rem", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#555", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" },
  td: { padding: "0.85rem 1.5rem", fontSize: "0.75rem", color: "#aaa", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  note: { display: "flex", gap: "0.5rem", padding: "1.25rem 1.5rem", fontSize: "0.65rem", color: "#555", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.05)", flexDirection: "column" },
};