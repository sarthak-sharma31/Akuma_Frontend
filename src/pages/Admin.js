import { useState, useEffect, useCallback } from "react";
// import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPackage, FiStar, FiX, FiCheck, FiRefreshCw, FiLogOut, FiShoppingBag, FiTruck, FiChevronDown, FiChevronUp, FiExternalLink, FiMenu, FiCamera } from "react-icons/fi";
import { RiSkullLine } from "react-icons/ri";
// import { verifyAdmin, getAdminProducts, createProduct, updateProduct, deleteProduct, toggleVisible, toggleStock, toggleFeatured, getAdminOrders, updateOrderStatus, getAdminReviews, createReview, updateReview, deleteReview, approveReview, getPendingReviews, uploadToCloudinary } from "../services/api";

import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPackage, FiStar, FiX, FiCheck, FiRefreshCw, FiLogOut, FiShoppingBag, FiTruck, FiChevronDown, FiChevronUp, FiExternalLink, FiMenu } from "react-icons/fi";

import { verifyAdmin, getAdminProducts, createProduct, updateProduct, deleteProduct, toggleVisible, toggleStock, toggleFeatured, getAdminOrders, updateOrderStatus, getAdminReviews, createReview, updateReview, deleteReview, approveReview, getPendingReviews } from "../services/api";


const EMPTY_FORM = {
  name: "", price: "", originalPrice: "", image: "", images: ["", "", ""], tag: "",
  sizes: ["S", "M", "L", "XL"], description: "", category: "Tees",
  meeshoUrl: "", featured: false, visible: true, inStock: true,
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const TAGS = ["", "BESTSELLER", "NEW DROP", "HOT", "LIMITED", "SALE"];
const CATEGORIES = ["Tees", "Hoodies", "Joggers", "Accessories"];

// ── Responsive hook ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Admin() {
  const isMobile = useIsMobile();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // product object
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewerName: "", rating: 5, comment: "", images: ["", "", ""], verified: true });
  const [editReview, setEditReview] = useState(null);
  const [savingReview, setSavingReview] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await getAdminProducts(password);
    if (data.success) setProducts(data.products);
    setLoading(false);
  }, [password]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    const data = await getAdminOrders(password, orderFilter);
    if (data.success) setOrders(data.orders);
    setOrdersLoading(false);
  }, [password, orderFilter]);

  useEffect(() => { if (authed) loadProducts(); }, [authed, loadProducts]);
  useEffect(() => { if (authed && activeTab === "orders") loadOrders(); }, [authed, activeTab, loadOrders]);
  useEffect(() => {
    if (authed && activeTab === "pending") {
      setPendingLoading(true);
      getPendingReviews(password).then((d) => { if (d.success) setPendingReviews(d.reviews); setPendingLoading(false); });
    }
  }, [authed, activeTab, password]);

  const handleUpdateOrderStatus = async (orderId, newStatus, notes) => {
    setUpdatingOrder(orderId);
    const data = await updateOrderStatus(orderId, { status: newStatus, notes }, password);
    if (data.success) {
      setOrders((prev) => prev.map((o) => o.orderId === orderId ? data.order : o));
      showToast("Order updated!");
    } else {
      showToast("Failed to update order", "error");
    }
    setUpdatingOrder(null);
  };

  const loadReviews = async (productId) => {
    setReviewsLoading(true);
    const data = await getAdminReviews(productId, password);
    if (data.success) setReviews(data.reviews);
    setReviewsLoading(false);
  };

  const openReviewModal = (product) => {
    setReviewModal(product);
    setEditReview(null);
    setReviewForm({ reviewerName: "", rating: 5, comment: "", images: ["", "", ""], verified: true });

    loadReviews(product._id);
  };

  const handleSaveReview = async () => {
    setSavingReview(true);
    const payload = { ...reviewForm, images: reviewForm.images.filter(Boolean), image: reviewForm.images.filter(Boolean)[0] || "", productId: reviewModal._id, rating: Number(reviewForm.rating) };
    const res = editReview
      ? await updateReview(editReview._id, payload, password)
      : await createReview(payload, password);
    if (res.success) {
      showToast(editReview ? "Review updated!" : "Review added!");
      setEditReview(null);
      setReviewForm({ reviewerName: "", rating: 5, comment: "", images: ["", "", ""], verified: true });
      loadReviews(reviewModal._id);
    } else {
      showToast("Failed to save review", "error");
    }
    setSavingReview(false);
  };

  const handleDeleteReview = async (id) => {
    await deleteReview(id, password);
    showToast("Review deleted", "error");
    loadReviews(reviewModal._id);
  };

  const handleApproveReview = async (id) => {
    const res = await approveReview(id, password);
    if (res.success) {
      setPendingReviews((prev) => prev.filter((r) => r._id !== id));
      showToast("Review approved!");
    } else {
      showToast("Failed to approve", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    const res = await verifyAdmin(password);
    if (res.success) { setAuthed(true); } else { setAuthError("Wrong password. Try again."); }
  };

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setFormError(""); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, price: p.price, originalPrice: p.originalPrice,
      image: p.image,
      images: p.images && p.images.length > 0 ? [...p.images, "", ""].slice(0, Math.max(3, p.images.length + 1)) : ["", "", ""],
      tag: p.tag || "", sizes: p.sizes, description: p.description, category: p.category,
      meeshoUrl: p.meeshoUrl || "", featured: p.featured, visible: p.visible, inStock: p.inStock,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      images: (form.images || []).filter((url) => url.trim() !== ""),
    };
    const res = editProduct ? await updateProduct(editProduct._id, payload, password) : await createProduct(payload, password);
    if (res.success) { showToast(editProduct ? "Product updated!" : "Product added!"); setModalOpen(false); loadProducts(); }
    else { setFormError(res.error || "Something went wrong"); }
    setSaving(false);
  };

  const handleToggleVisible  = async (p) => { await toggleVisible(p._id, password);  showToast(`${p.name} is now ${p.visible ? "hidden" : "visible"}`); loadProducts(); };
  const handleToggleStock    = async (p) => { await toggleStock(p._id, password);    showToast(`${p.name} marked as ${p.inStock ? "out of stock" : "in stock"}`); loadProducts(); };
  const handleToggleFeatured = async (p) => { await toggleFeatured(p._id, password); showToast(`${p.name} ${p.featured ? "removed from" : "added to"} featured`); loadProducts(); };
  const handleDelete         = async (id) => { await deleteProduct(id, password); showToast("Product deleted", "error"); setDeleteConfirm(null); loadProducts(); };
  const toggleSize = (sz) => setForm((prev) => ({
    ...prev,
    sizes: prev.sizes.includes(sz) ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz],
  }));

  // ── Login ──
  if (!authed) return (
    <div style={s.loginPage}>
      <div style={s.loginBox}>
        <RiSkullLine size={48} color="#ff2d2d" style={{ marginBottom: "1rem" }} />
        <h1 style={s.loginTitle}>ADMIN</h1>
        <p style={s.loginSub}>AkumaFits Control Panel</p>
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>ADMIN PASSWORD</label>
          <input className="form-input" type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {authError && <p style={s.errorText}>{authError}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>ENTER THE DARK SIDE</button>
        </form>
      </div>
    </div>
  );

  const stats = {
    total: products.length,
    visible: products.filter((p) => p.visible).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    featured: products.filter((p) => p.featured).length,
  };

  return (
    <div style={s.dashboard}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#1a0000" : "#001a00", borderColor: toast.type === "error" ? "#ff2d2d" : "#00cc66" }}>
          {toast.type === "error" ? <FiTrash2 size={14} color="#ff2d2d" /> : <FiCheck size={14} color="#00cc66" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={s.dashHeader}>
        <div style={s.dashHeaderLeft}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#ff2d2d" }}>AKUMA</span>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#f0f0f0" }}>FITS</span>
          <span style={{ color: "#555", fontSize: "0.65rem", letterSpacing: "0.2em", marginLeft: "0.75rem" }}>ADMIN</span>
        </div>

        {isMobile ? (
          // Mobile header — hamburger menu
          <button style={s.menuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <FiMenu size={20} color="#f0f0f0" />
          </button>
        ) : (
          // Desktop header — tabs + logout
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {["products", "orders"].map((tab) => (
              <button key={tab} style={{ ...s.tabBtn, borderBottom: activeTab === tab ? "2px solid #ff2d2d" : "2px solid transparent", color: activeTab === tab ? "#f0f0f0" : "#555" }} onClick={() => setActiveTab(tab)}>
                {tab === "products" ? <><FiPackage size={13} /> PRODUCTS</> : <><FiShoppingBag size={13} /> ORDERS</>}
              </button>
            ))}
            <button style={s.logoutBtn} onClick={() => { setAuthed(false); setPassword(""); }}>
              <FiLogOut size={15} /> LOGOUT
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && mobileMenuOpen && (
        <div style={s.mobileMenu}>
          {["products", "orders", "pending"].map((tab) => (
            <button key={tab} style={{ ...s.mobileMenuItem, color: activeTab === tab ? "#ff2d2d" : "#888", borderLeft: activeTab === tab ? "2px solid #ff2d2d" : "2px solid transparent" }}
              onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}>
              {tab === "products" ? <><FiPackage size={14} /> PRODUCTS</>
               : tab === "orders" ? <><FiShoppingBag size={14} /> ORDERS</>
               : <><FiStar size={14} /> REVIEWS</>}
            </button>
          ))}
          <button style={{ ...s.mobileMenuItem, color: "#ff2d2d", borderLeft: "2px solid transparent" }} onClick={() => { setAuthed(false); setPassword(""); }}>
            <FiLogOut size={14} /> LOGOUT
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div style={s.dashBody}>

        {/* Stat cards */}
        <div style={{ ...s.statsRow, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {[
            { label: "PRODUCTS", val: stats.total,      icon: <FiPackage size={18} />, color: "#ff2d2d" },
            { label: "VISIBLE",  val: stats.visible,    icon: <FiEye size={18} />,     color: "#00aaff" },
            { label: "SOLD OUT", val: stats.outOfStock, icon: <FiPackage size={18} />, color: "#ff6b00" },
            { label: "FEATURED", val: stats.featured,   icon: <FiStar size={18} />,    color: "#f0d000" },
          ].map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={{ color: st.color, marginBottom: "0.4rem" }}>{st.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: st.color, lineHeight: 1 }}>{st.val}</div>
              <div style={{ fontSize: "0.5rem", letterSpacing: "0.2em", color: "#555", marginTop: "0.2rem" }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div style={s.tableWrap}>
            <div style={{ ...s.tableHeader, flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 style={s.tableTitle}>ORDERS</h2>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {["", "Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((f) => (
                  <button key={f || "all"} onClick={() => setOrderFilter(f)}
                    style={{ ...s.filterBtn, background: orderFilter === f ? "#ff2d2d" : "transparent", color: orderFilter === f ? "#fff" : "#666", borderColor: orderFilter === f ? "#ff2d2d" : "rgba(255,255,255,0.1)" }}>
                    {f || "ALL"}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: "center", padding: "4rem" }}>
                <FiRefreshCw size={28} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>
                <FiShoppingBag size={40} color="#ff2d2d" style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.75rem" }}>No orders yet.</p>
              </div>
            ) : (
              <div>
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.orderId;
                  const statusColor = { Placed: "#ff9900", Confirmed: "#ff6b00", Shipped: "#4da6ff", Delivered: "#00cc66", Cancelled: "#ff2d2d" }[order.status] || "#888";
                  return (
                    <div key={order.orderId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", padding: "1rem 1.25rem", gap: "0.75rem", cursor: "pointer", flexWrap: "wrap" }}
                        onClick={() => setExpandedOrder(isExpanded ? null : order.orderId)}>
                        <div style={{ minWidth: isMobile ? "100%" : 140, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#ff2d2d" }}>{order.orderId}</div>
                          {isMobile && <span style={{ fontSize: "0.55rem", letterSpacing: "0.1em", fontWeight: 700, padding: "0.2rem 0.5rem", border: `1px solid ${statusColor}`, color: statusColor }}>{order.status.toUpperCase()}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700 }}>{order.customer.name}</div>
                          <div style={{ fontSize: "0.58rem", color: "#555" }}>{order.customer.phone} • {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        </div>
                        {!isMobile && (
                          <>
                            <div style={{ fontSize: "0.65rem", color: "#888" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#f0f0f0" }}>₹{order.total}</div>
                            <span style={{ fontSize: "0.6rem", letterSpacing: "0.15em", fontWeight: 700, padding: "0.25rem 0.6rem", border: `1px solid ${statusColor}`, color: statusColor, minWidth: 80, textAlign: "center" }}>
                              {order.status.toUpperCase()}
                            </span>
                          </>
                        )}
                        {isMobile && <div style={{ fontSize: "0.72rem", color: "#f0f0f0", fontFamily: "'Bebas Neue', sans-serif" }}>₹{order.total} • {order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>}
                        {isExpanded ? <FiChevronUp size={14} color="#555" style={{ marginLeft: "auto" }} /> : <FiChevronDown size={14} color="#555" style={{ marginLeft: "auto" }} />}
                      </div>

                      {isExpanded && (
                        <div style={{ background: "#080808", padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                            <div style={{ flex: 2, minWidth: 200 }}>
                              <div style={s.orderDetailLabel}>ITEMS</div>
                              {order.items.map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", alignItems: "center" }}>
                                  {item.image && <img src={item.image} alt={item.name} style={{ width: 44, height: 56, objectFit: "cover" }} />}
                                  <div>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 700 }}>{item.name}</div>
                                    <div style={{ fontSize: "0.6rem", color: "#555" }}>Size: {item.size} • Qty: {item.qty} • ₹{item.price * item.qty}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ flex: 1, minWidth: 160 }}>
                              <div style={s.orderDetailLabel}>CUSTOMER</div>
                              <div style={{ fontSize: "0.7rem", lineHeight: 2, color: "#888" }}>
                                <div style={{ color: "#f0f0f0" }}>{order.customer.name}</div>
                                <div>{order.customer.email}</div>
                                <div>{order.customer.phone}</div>
                                <div style={{ marginTop: "0.25rem" }}>{order.customer.address}</div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div style={s.orderDetailLabel}>UPDATE STATUS</div>
                              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                                {["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                                  <button key={st} disabled={updatingOrder === order.orderId}
                                    onClick={() => handleUpdateOrderStatus(order.orderId, st, order.notes || "")}
                                    style={{ ...s.statusChangeBtn, background: order.status === st ? statusColor : "transparent", color: order.status === st ? "#fff" : "#666", borderColor: order.status === st ? statusColor : "rgba(255,255,255,0.1)", opacity: updatingOrder === order.orderId ? 0.5 : 1 }}>
                                    {st === "Shipped" && <FiTruck size={10} style={{ marginRight: 3 }} />}{st}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div style={{ flex: 2, minWidth: 200 }}>
                              <div style={s.orderDetailLabel}>NOTE TO CUSTOMER</div>
                              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
                                <input className="form-input" defaultValue={order.notes} placeholder="Tracking number or note..."
                                  id={`notes-${order.orderId}`} style={{ flex: 1, fontSize: "0.7rem" }} />
                                <button className="btn-primary" style={{ padding: "0.5rem 0.9rem", fontSize: "0.6rem", whiteSpace: "nowrap" }}
                                  onClick={() => { const notes = document.getElementById(`notes-${order.orderId}`).value; handleUpdateOrderStatus(order.orderId, order.status, notes); }}>
                                  SAVE
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PENDING REVIEWS TAB ── */}
        {activeTab === "pending" && (
          <div style={s.tableWrap}>
            <div style={{ ...s.tableHeader }}>
              <h2 style={s.tableTitle}>PENDING REVIEWS</h2>
              <span style={{ fontSize: "0.65rem", color: "#555" }}>Approve or delete customer-submitted reviews</span>
            </div>
            {pendingLoading ? (
              <div style={{ textAlign: "center", padding: "4rem" }}>
                <FiRefreshCw size={28} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : pendingReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>
                <FiStar size={40} color="#ff2d2d" style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.75rem" }}>No pending reviews.</p>
              </div>
            ) : (
              <div>
                {pendingReviews.map((r) => (
                  <div key={r._id} style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {r.image && <img src={r.image} alt="review" style={{ width: 64, height: 64, objectFit: "cover", flexShrink: 0 }} onError={(e) => e.target.style.display="none"} />}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{r.reviewerName}</span>
                        <span style={{ fontSize: "0.65rem", color: "#ff2d2d" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      </div>
                      <div style={{ fontSize: "0.58rem", color: "#555", marginBottom: "0.4rem" }}>{r.reviewerEmail}</div>
                      {r.comment && <p style={{ fontSize: "0.7rem", color: "#888", lineHeight: 1.7 }}>{r.comment}</p>}
                      <div style={{ fontSize: "0.55rem", color: "#444", marginTop: "0.4rem" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button className="btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.58rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                        onClick={() => handleApproveReview(r._id)}>
                        <FiCheck size={12} /> APPROVE
                      </button>
                      <button style={{ ...s.actionBtn, color: "#ff2d2d" }} onClick={() => handleDeleteReview(r._id)}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (
          <div style={s.tableWrap}>
            <div style={{ ...s.tableHeader, flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 style={s.tableTitle}>PRODUCTS</h2>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem" }} onClick={openAdd}>
                <FiPlus size={15} /> ADD PRODUCT
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem" }}>
                <FiRefreshCw size={28} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>
                <RiSkullLine size={40} color="#ff2d2d" style={{ opacity: 0.3, marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.75rem" }}>No products yet. Add your first one!</p>
              </div>
            ) : isMobile ? (
              // ── MOBILE: Card layout instead of table ──
              <div style={{ padding: "0.75rem" }}>
                {products.map((p) => (
                  <div key={p._id} style={{ ...s.mobileProductCard, opacity: p.visible ? 1 : 0.5 }}>
                    <img src={p.image} alt={p.name} style={s.mobileProductImg} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.2rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                        {p.tag && <span style={{ ...s.tagPill, background: p.tag === "LIMITED" ? "#9b30ff" : "#ff2d2d" }}>{p.tag}</span>}
                        {p.featured && <span style={{ ...s.tagPill, background: "#f0d000", color: "#000" }}>★</span>}
                        <span style={{ fontSize: "0.55rem", color: p.visible ? "#00cc66" : "#555" }}>{p.visible ? "Visible" : "Hidden"}</span>
                        <span style={{ fontSize: "0.55rem", color: p.inStock ? "#00aaff" : "#ff6b00" }}>{p.inStock ? "In Stock" : "Out of Stock"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f0f0f0" }}>₹{p.price}</span>
                        <span style={{ fontSize: "0.6rem", color: "#555", textDecoration: "line-through" }}>₹{p.originalPrice}</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", width: "100%" }}>
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center" }} onClick={() => openEdit(p)}><FiEdit2 size={13} /></button>
                        {p.meeshoUrl && (
                          <a href={p.meeshoUrl} target="_blank" rel="noreferrer" style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: "#ff9900", textDecoration: "none", display: "flex", alignItems: "center" }}>
                            <FiExternalLink size={13} />
                          </a>
                        )}
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: p.visible ? "#00cc66" : "#555" }} onClick={() => handleToggleVisible(p)}>
                          {p.visible ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                        </button>
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: p.inStock ? "#00aaff" : "#ff6b00" }} onClick={() => handleToggleStock(p)}><FiPackage size={13} /></button>
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: p.featured ? "#f0d000" : "#555" }} onClick={() => handleToggleFeatured(p)}><FiStar size={13} /></button>
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: "#ff9900" }} onClick={() => openReviewModal(p)}><FiStar size={13} /></button>
                        <button style={{ ...s.actionBtn, flex: 1, justifyContent: "center", color: "#ff2d2d" }} onClick={() => setDeleteConfirm(p)}><FiTrash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // ── DESKTOP: Table layout ──
              <div style={s.tableScroll}>
                <table style={s.table}>
                  <thead>
                    <tr>{["IMAGE", "NAME", "PRICE", "CATEGORY", "STATUS", "ACTIONS"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} style={{ ...s.tr, opacity: p.visible ? 1 : 0.45 }}>
                        <td style={s.td}><img src={p.image} alt={p.name} style={s.thumbImg} /></td>
                        <td style={s.td}>
                          <div style={s.productName}>{p.name}</div>
                          {p.tag && <span style={{ ...s.tagPill, background: p.tag === "LIMITED" ? "#9b30ff" : "#ff2d2d" }}>{p.tag}</span>}
                          {p.featured && <span style={{ ...s.tagPill, background: "#f0d000", color: "#000" }}>FEATURED</span>}
                        </td>
                        <td style={s.td}>
                          <div style={s.priceCell}>₹{p.price}</div>
                          <div style={s.originalCell}>₹{p.originalPrice}</div>
                        </td>
                        <td style={s.td}><span style={s.catPill}>{p.category}</span></td>
                        <td style={s.td}>
                          <div style={s.statusCol}>
                            <span style={{ ...s.statusDot, background: p.visible ? "#00cc66" : "#555" }} />
                            <span style={{ ...s.statusDot, background: p.inStock ? "#00aaff" : "#ff6b00" }} />
                          </div>
                          <div style={s.statusLabels}>
                            <span style={{ color: p.visible ? "#00cc66" : "#555", fontSize: "0.55rem" }}>{p.visible ? "Visible" : "Hidden"}</span>
                            <span style={{ color: p.inStock ? "#00aaff" : "#ff6b00", fontSize: "0.55rem" }}>{p.inStock ? "In Stock" : "Out of Stock"}</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button style={s.actionBtn} title="Edit" onClick={() => openEdit(p)}><FiEdit2 size={14} /></button>
                            {p.meeshoUrl && (
                              <a href={p.meeshoUrl} target="_blank" rel="noreferrer" title="View on Meesho"
                                style={{ ...s.actionBtn, color: "#ff9900", textDecoration: "none", display: "flex", alignItems: "center" }}>
                                <FiExternalLink size={14} />
                              </a>
                            )}
                            <button style={{ ...s.actionBtn, color: p.visible ? "#00cc66" : "#555" }} onClick={() => handleToggleVisible(p)}>
                              {p.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                            </button>
                            <button style={{ ...s.actionBtn, color: p.inStock ? "#00aaff" : "#ff6b00" }} onClick={() => handleToggleStock(p)}><FiPackage size={14} /></button>
                            <button style={{ ...s.actionBtn, color: p.featured ? "#f0d000" : "#555" }} onClick={() => handleToggleFeatured(p)}><FiStar size={14} /></button>
                            <button style={{ ...s.actionBtn, color: "#ff9900" }} title="Reviews" onClick={() => openReviewModal(p)}>
                              <FiStar size={14} />
                            </button>
                            <button style={{ ...s.actionBtn, color: "#ff2d2d" }} onClick={() => setDeleteConfirm(p)}><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div style={s.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={{ ...s.modal, maxWidth: isMobile ? "100%" : 680, margin: isMobile ? "0" : "auto", borderRadius: isMobile ? "12px 12px 0 0" : 0, position: isMobile ? "fixed" : "relative", bottom: isMobile ? 0 : "auto", left: isMobile ? 0 : "auto", right: isMobile ? 0 : "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editProduct ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2>
              <button style={s.closeBtn} onClick={() => setModalOpen(false)}><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={s.modalForm}>
              <div style={s.formGroup}>
                <label className="form-label">PRODUCT NAME *</label>
                <input className="form-input" required placeholder="Shadow Monarch Oversized Tee" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label className="form-label">SELLING PRICE (₹) *</label>
                  <input className="form-input" type="number" required min="0" placeholder="799" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div style={s.formGroup}>
                  <label className="form-label">ORIGINAL PRICE (₹) *</label>
                  <input className="form-input" type="number" required min="0" placeholder="1199" value={form.originalPrice} onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))} />
                </div>
              </div>

              <div style={s.formGroup}>
                <label className="form-label">PRODUCT IMAGES * <span style={{ color: "#555", fontWeight: 400 }}>— 1st is main. Add up to 5 total.</span></label>
                <div style={s.imgRow}>
                  <div style={s.imgInputWrap}>
                    <span style={s.imgBadge}>MAIN</span>
                    <input className="form-input" required placeholder="Main image URL (required)" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} style={{ paddingLeft: "3.8rem" }} />
                  </div>
                  {form.image && <img src={form.image} alt="main" style={s.imgThumbPreview} onError={(e) => e.target.style.display = "none"} />}
                </div>
                {(form.images || []).map((url, i) => (
                  <div key={i} style={s.imgRow}>
                    <div style={s.imgInputWrap}>
                      <span style={{ ...s.imgBadge, background: "rgba(255,255,255,0.05)", color: "#555" }}>#{i + 2}</span>
                      <input className="form-input" placeholder={`Extra image ${i + 2} URL (optional)`} value={url}
                        onChange={(e) => { const updated = [...(form.images || [])]; updated[i] = e.target.value; setForm((p) => ({ ...p, images: updated })); }}
                        style={{ paddingLeft: "3rem" }} />
                    </div>
                    {url && <img src={url} alt={`extra ${i + 2}`} style={s.imgThumbPreview} onError={(e) => e.target.style.display = "none"} />}
                  </div>
                ))}
                <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.4rem" }}>
                  {(form.images || []).length < 4 && (
                    <button type="button" style={s.imgSlotBtn} onClick={() => setForm((p) => ({ ...p, images: [...(p.images || []), ""] }))}>+ ADD IMAGE SLOT</button>
                  )}
                  {(form.images || []).length > 0 && (
                    <button type="button" style={{ ...s.imgSlotBtn, color: "#ff2d2d", borderColor: "rgba(255,45,45,0.3)" }} onClick={() => setForm((p) => ({ ...p, images: (p.images || []).slice(0, -1) }))}>− REMOVE LAST</button>
                  )}
                </div>
              </div>

              <div style={s.formGroup}>
                <label className="form-label">MEESHO PRODUCT URL <span style={{ color: "#555", fontWeight: 400 }}>(for your reference)</span></label>
                <input className="form-input" placeholder="https://meesho.com/..." value={form.meeshoUrl} onChange={(e) => setForm((p) => ({ ...p, meeshoUrl: e.target.value }))} />
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label className="form-label">CATEGORY *</label>
                  <select className="form-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label className="form-label">TAG</label>
                  <select className="form-input" value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}>
                    {TAGS.map((t) => <option key={t} value={t}>{t || "— None —"}</option>)}
                  </select>
                </div>
              </div>

              <div style={s.formGroup}>
                <label className="form-label">AVAILABLE SIZES *</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {ALL_SIZES.map((sz) => (
                    <button key={sz} type="button" className={`size-btn${form.sizes.includes(sz) ? " active" : ""}`} onClick={() => toggleSize(sz)}>{sz}</button>
                  ))}
                </div>
              </div>

              <div style={s.formGroup}>
                <label className="form-label">DESCRIPTION *</label>
                <textarea className="form-input form-textarea" required rows={3} placeholder="Premium oversized tee with..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>

              <div style={s.togglesRow}>
                {[{ key: "featured", label: "FEATURED" }, { key: "visible", label: "VISIBLE" }, { key: "inStock", label: "IN STOCK" }].map((t) => (
                  <label key={t.key} style={s.toggleLabel}>
                    <div style={{ ...s.toggle, background: form[t.key] ? "#ff2d2d" : "#333" }} onClick={() => setForm((p) => ({ ...p, [t.key]: !p[t.key] }))}>
                      <div style={{ ...s.toggleThumb, transform: form[t.key] ? "translateX(20px)" : "translateX(0)" }} />
                    </div>
                    <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: form[t.key] ? "#f0f0f0" : "#666" }}>{t.label}</span>
                  </label>
                ))}
              </div>

              {formError && <p style={s.errorText}>{formError}</p>}

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn-outline" style={{ flex: 1, textAlign: "center" }} onClick={() => setModalOpen(false)}>CANCEL</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} disabled={saving}>
                  {saving ? <FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiCheck size={14} />}
                  {saving ? "SAVING..." : editProduct ? "SAVE CHANGES" : "ADD PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewModal && (
        <div style={s.modalOverlay} onClick={() => setReviewModal(null)}>
          <div style={{ ...s.modal, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>REVIEWS — {reviewModal.name.slice(0, 30)}{reviewModal.name.length > 30 ? "..." : ""}</h2>
              <button style={s.closeBtn} onClick={() => setReviewModal(null)}><FiX size={18} /></button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>

              {/* Add/Edit form */}
              <div style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#ff2d2d", marginBottom: "1rem" }}>
                  {editReview ? "EDIT REVIEW" : "ADD REVIEW"}
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 2, minWidth: 160 }}>
                    <label className="form-label">REVIEWER NAME *</label>
                    <input className="form-input" placeholder="e.g. Aditya Kumar" value={reviewForm.reviewerName}
                      onChange={(e) => setReviewForm((p) => ({ ...p, reviewerName: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <label className="form-label">RATING *</label>
                    <select className="form-input" value={reviewForm.rating}
                      onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))}>
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ⭐</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="form-label">COMMENT (optional)</label>
                  <textarea className="form-input" rows={2} placeholder="Review text..."
                    value={reviewForm.comment} style={{ resize: "none" }}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} />
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label className="form-label">REVIEW IMAGE URLs <span style={{ color: "#555", fontWeight: 400 }}>(optional, up to 3)</span></label>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", alignItems: "center" }}>
                      <input className="form-input" placeholder={`Image ${i + 1} URL (optional)`} style={{ fontSize: "0.68rem" }}
                        value={(reviewForm.images || [])[i] || ""}
                        onChange={(e) => {
                          const imgs = [...(reviewForm.images || ["", "", ""])];
                          imgs[i] = e.target.value;
                          setReviewForm((p) => ({ ...p, images: imgs }));
                        }} />
                      {(reviewForm.images || [])[i] && (
                        <img src={(reviewForm.images || [])[i]} alt="preview"
                          style={{ width: 36, height: 36, objectFit: "cover", flexShrink: 0 }}
                          onError={(e) => e.target.style.display = "none"} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <label style={s.toggleLabel}>
                    <div style={{ ...s.toggle, background: reviewForm.verified ? "#ff2d2d" : "#333" }}
                      onClick={() => setReviewForm((p) => ({ ...p, verified: !p.verified }))}>
                      <div style={{ ...s.toggleThumb, transform: reviewForm.verified ? "translateX(20px)" : "translateX(0)" }} />
                    </div>
                    <span style={{ fontSize: "0.65rem", color: reviewForm.verified ? "#f0f0f0" : "#666" }}>Verified Purchase</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                    {editReview && (
                      <button className="btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}
                        onClick={() => { setEditReview(null); setReviewForm({ reviewerName: "", rating: 5, comment: "", image: "", verified: true }); }}>
                        CANCEL
                      </button>
                    )}
                    <button className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.6rem", opacity: savingReview ? 0.6 : 1 }}
                      onClick={handleSaveReview} disabled={savingReview || !reviewForm.reviewerName}>
                      {savingReview ? "SAVING..." : editReview ? "SAVE CHANGES" : "ADD REVIEW"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews list */}
              {reviewsLoading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <FiRefreshCw size={22} color="#ff2d2d" style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : reviews.length === 0 ? (
                <p style={{ fontSize: "0.7rem", color: "#555", textAlign: "center", padding: "1rem" }}>No reviews yet — add the first one above.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 360, overflowY: "auto" }}>
                  {reviews.map((r) => (
                    <div key={r._id} style={{ background: "#080808", border: "1px solid rgba(255,255,255,0.05)", padding: "0.9rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      {r.image && <img src={r.image} alt="review" style={{ width: 48, height: 48, objectFit: "cover", flexShrink: 0 }} onError={(e) => e.target.style.display="none"} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>{r.reviewerName}</span>
                          <span style={{ fontSize: "0.65rem", color: "#ff2d2d" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        </div>
                        {r.verified && <span style={{ fontSize: "0.55rem", color: "#00cc66" }}>✓ Verified Purchase &nbsp;</span>}
                        {r.comment && <p style={{ fontSize: "0.68rem", color: "#888", marginTop: "0.3rem", lineHeight: 1.6 }}>{r.comment}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                        <button style={s.actionBtn} onClick={() => { setEditReview(r); setReviewForm({ reviewerName: r.reviewerName, rating: r.rating, comment: r.comment || "", images: r.images && r.images.length > 0 ? [...r.images, "", ""].slice(0, 3) : [r.image || "", "", ""], verified: r.verified }); }}>
                          <FiEdit2 size={13} />
                        </button>
                        <button style={{ ...s.actionBtn, color: "#ff2d2d" }} onClick={() => handleDeleteReview(r._id)}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={s.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: 400, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <FiTrash2 size={40} color="#ff2d2d" style={{ marginBottom: "1rem" }} />
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", marginBottom: "0.5rem" }}>DELETE PRODUCT?</h3>
            <p style={{ color: "#888", fontSize: "0.75rem", marginBottom: "2rem", lineHeight: 1.7 }}>"{deleteConfirm.name}" will be permanently removed. This cannot be undone.</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-outline" style={{ flex: 1, textAlign: "center" }} onClick={() => setDeleteConfirm(null)}>CANCEL</button>
              <button className="btn-primary" style={{ flex: 1, textAlign: "center" }} onClick={() => handleDelete(deleteConfirm._id)}>DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  loginPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 },
  loginBox: { background: "#0f0f0f", border: "1px solid rgba(255,45,45,0.2)", padding: "3rem 2.5rem", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" },
  loginTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "0.1em", color: "#ff2d2d" },
  loginSub: { color: "#555", fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "2rem" },
  dashboard: { minHeight: "100vh", background: "#080808", position: "relative", zIndex: 1, paddingTop: 64 },
  dashHeader: { background: "rgba(8,8,8,0.96)", borderBottom: "1px solid rgba(255,45,45,0.15)", padding: "0 1.25rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
  dashHeaderLeft: { display: "flex", alignItems: "baseline", gap: "0.15rem" },
  menuBtn: { background: "none", border: "none", cursor: "pointer", padding: "0.5rem", display: "flex", alignItems: "center" },
  mobileMenu: { background: "#0a0a0a", borderBottom: "1px solid rgba(255,45,45,0.15)", position: "sticky", top: 64, zIndex: 49 },
  mobileMenuItem: { display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", background: "none", border: "none", padding: "1rem 1.5rem", fontSize: "0.65rem", letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.2s" },
  logoutBtn: { background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", padding: "0.4rem 0.9rem", fontSize: "0.6rem", letterSpacing: "0.15em", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" },
  tabBtn: { background: "none", border: "none", borderBottom: "2px solid transparent", padding: "0 0.75rem", height: 40, cursor: "pointer", fontSize: "0.6rem", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: "0.4rem" },
  dashBody: { maxWidth: 1300, margin: "0 auto", padding: "1.5rem 1rem" },
  statsRow: { display: "grid", gap: "0.75rem", marginBottom: "1.5rem" },
  statCard: { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem", textAlign: "center" },
  tableWrap: { background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.06)" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tableTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em" },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 1rem", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#555", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" },
  td: { padding: "0.9rem 1rem", verticalAlign: "middle" },
  thumbImg: { width: 52, height: 66, objectFit: "cover", display: "block" },
  productName: { fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.3rem", maxWidth: 220 },
  tagPill: { display: "inline-block", fontSize: "0.5rem", letterSpacing: "0.15em", padding: "0.15rem 0.4rem", color: "#fff", marginRight: "0.3rem" },
  priceCell: { fontSize: "0.85rem", fontWeight: 700, color: "#f0f0f0" },
  originalCell: { fontSize: "0.65rem", color: "#555", textDecoration: "line-through" },
  catPill: { fontSize: "0.6rem", letterSpacing: "0.1em", color: "#ff2d2d", border: "1px solid rgba(255,45,45,0.3)", padding: "0.2rem 0.5rem" },
  statusCol: { display: "flex", gap: "0.4rem", marginBottom: "0.3rem" },
  statusDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  statusLabels: { display: "flex", flexDirection: "column", gap: "0.1rem" },
  actions: { display: "flex", gap: "0.3rem", flexWrap: "wrap" },
  actionBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#888", padding: "0.4rem", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" },
  mobileProductCard: { display: "flex", gap: "0.75rem", padding: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "flex-start" },
  mobileProductImg: { width: 60, height: 76, objectFit: "cover", flexShrink: 0 },
  filterBtn: { background: "transparent", border: "1px solid", padding: "0.25rem 0.6rem", fontSize: "0.55rem", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s" },
  orderDetailLabel: { fontSize: "0.5rem", letterSpacing: "0.25em", color: "#444", marginBottom: "0.5rem" },
  statusChangeBtn: { background: "transparent", border: "1px solid", padding: "0.3rem 0.6rem", fontSize: "0.58rem", letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" },
  modal: { background: "#0f0f0f", border: "1px solid rgba(255,45,45,0.2)", width: "100%", maxHeight: "92vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0f0f0f", zIndex: 10 },
  modalTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.08em" },
  closeBtn: { background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex" },
  modalForm: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.2rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 },
  formRow: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  imgRow: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" },
  imgInputWrap: { flex: 1, position: "relative" },
  imgBadge: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.5rem", letterSpacing: "0.15em", fontWeight: 700, background: "#ff2d2d", color: "#fff", padding: "0.15rem 0.4rem", zIndex: 1, pointerEvents: "none" },
  imgThumbPreview: { width: 44, height: 56, objectFit: "cover", border: "1px solid rgba(255,45,45,0.3)", flexShrink: 0 },
  imgSlotBtn: { background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "#888", padding: "0.35rem 0.8rem", fontSize: "0.58rem", letterSpacing: "0.15em", cursor: "pointer", fontFamily: "'Space Mono', monospace" },
  togglesRow: { display: "flex", gap: "1.5rem", flexWrap: "wrap" },
  toggleLabel: { display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" },
  toggle: { width: 44, height: 24, borderRadius: 12, position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleThumb: { position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "transform 0.2s" },
  errorText: { color: "#ff2d2d", fontSize: "0.7rem", letterSpacing: "0.05em" },
  toast: { position: "fixed", bottom: "2rem", right: "1rem", left: "1rem", zIndex: 500, border: "1px solid", padding: "0.75rem 1.25rem", fontSize: "0.7rem", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.6rem", color: "#f0f0f0", backdropFilter: "blur(8px)" },
};
