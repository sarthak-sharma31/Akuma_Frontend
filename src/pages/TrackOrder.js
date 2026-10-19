import { useState } from "react";
import { trackOrder, updateOrderDetails } from "../services/api";
import { FiSearch, FiCheckCircle, FiXCircle, FiTruck, FiClock, FiBox, FiChevronRight, FiArrowLeft, FiEdit2, FiSave, FiX } from "react-icons/fi";

const STATUS_STEPS = ["Placed", "Confirmed", "Shipped", "Delivered"];
const STATUS_META = {
  Placed:    { icon: <FiClock size={15} />,       color: "#ff9900", desc: "We've received your order and are reviewing it." },
  Confirmed: { icon: <FiBox size={15} />,         color: "#ff6b00", desc: "Your order is confirmed and being packed." },
  Shipped:   { icon: <FiTruck size={15} />,       color: "#4da6ff", desc: "Your order is on its way! Delivery in 2–4 days." },
  Delivered: { icon: <FiCheckCircle size={15} />, color: "#00cc66", desc: "Your order has been delivered. Enjoy!" },
  Cancelled: { icon: <FiXCircle size={15} />,     color: "#ff2d2d", desc: "This order was cancelled. Contact us for help." },
};

function OrderDetail({ order: initialOrder, onBack, email }) {
  const [order, setOrder] = useState(initialOrder);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: order.customer.name, phone: order.customer.phone, address: order.customer.address });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const statusMeta  = STATUS_META[order.status];
  const stepIndex   = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const canEdit     = order.status === "Placed";

  const handleSaveDetails = async () => {
    if (editForm.phone.length !== 10) { setSaveError("Phone must be exactly 10 digits"); return; }
    setSaving(true);
    setSaveError("");
    const data = await updateOrderDetails(order.orderId, email, editForm);
    setSaving(false);
    if (data.success) {
      setOrder(data.order);
      setEditing(false);
      setSaveSuccess("Details updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } else {
      setSaveError(data.error || "Failed to update. Try again.");
    }
  };

  return (
    <div style={s.resultCard}>
      {onBack && (
        <button style={s.backBtn} onClick={onBack}>
          <FiArrowLeft size={13} /> BACK TO ALL ORDERS
        </button>
      )}

      <div style={s.resultHeader}>
        <div>
          <div style={s.resultLabel}>ORDER ID</div>
          <div style={s.resultOrderId}>{order.orderId}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={s.resultLabel}>DATE</div>
          <div style={s.resultDate}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
        </div>
      </div>

      <div style={{ ...s.statusBadge, borderColor: statusMeta.color, color: statusMeta.color }}>
        {statusMeta.icon}
        <span style={{ letterSpacing: "0.15em", fontSize: "0.7rem", fontWeight: 700 }}>{order.status.toUpperCase()}</span>
      </div>
      <p style={s.statusDesc}>{statusMeta.desc}</p>

      {!isCancelled && (
        <div style={s.progressWrap}>
          {STATUS_STEPS.map((step, i) => (
            <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ position: "absolute", top: 11, left: "50%", width: "100%", height: 2, background: i < stepIndex ? "#ff2d2d" : "rgba(255,255,255,0.08)" }} />
              )}
              <div style={{ width: 22, height: 22, borderRadius: "50%", zIndex: 1, background: i <= stepIndex ? "#ff2d2d" : "#0d0d0d", border: `2px solid ${i <= stepIndex ? "#ff2d2d" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i < stepIndex && <FiCheckCircle size={11} color="#fff" />}
                {i === stepIndex && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div style={{ fontSize: "0.5rem", letterSpacing: "0.1em", color: i <= stepIndex ? "#f0f0f0" : "#444", marginTop: "0.4rem", textAlign: "center" }}>
                {step.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {order.notes && (
        <div style={s.notesBox}>
          <div style={s.notesLabel}>NOTE FROM AKUMAFITS</div>
          <div style={s.notesText}>{order.notes}</div>
        </div>
      )}

      <div style={s.itemsSection}>
        <div style={s.sectionTitle}>ITEMS IN THIS ORDER</div>
        {order.items.map((item, i) => (
          <div key={i} style={s.item}>
            {item.image && <img src={item.image} alt={item.name} style={s.itemImg} />}
            <div style={s.itemInfo}>
              <div style={s.itemName}>{item.name}</div>
              <div style={s.itemMeta}>Size: {item.size} &nbsp;•&nbsp; Qty: {item.qty}</div>
            </div>
            <div style={s.itemPrice}>₹{item.price * item.qty}</div>
          </div>
        ))}
      </div>

      {/* Delivery details — editable if status is Placed */}
      <div style={{ ...s.summaryRow, flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={s.sectionTitle}>DELIVER TO</div>
          {canEdit && !editing && (
            <button style={s.editBtn} onClick={() => { setEditing(true); setSaveError(""); setSaveSuccess(""); }}>
              <FiEdit2 size={12} /> EDIT DETAILS
            </button>
          )}
          {editing && (
            <button style={{ ...s.editBtn, color: "#555" }} onClick={() => { setEditing(false); setSaveError(""); setEditForm({ name: order.customer.name, phone: order.customer.phone, address: order.customer.address }); }}>
              <FiX size={12} /> CANCEL
            </button>
          )}
        </div>

        {canEdit && !editing && (
          <div style={s.editHint}>
            <FiEdit2 size={11} /> You can edit your delivery details while the order is pending confirmation.
          </div>
        )}

        {!editing ? (
          <div>
            <div style={s.summaryText}>{order.customer.name}</div>
            <div style={s.summarySubtext}>{order.customer.address}</div>
            <div style={s.summarySubtext}>{order.customer.phone}</div>
            <div style={s.summarySubtext}>{order.customer.email}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div>
              <label className="form-label">FULL NAME</label>
              <input className="form-input" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">PHONE NUMBER</label>
              <input className="form-input" value={editForm.phone} inputMode="numeric" maxLength={10}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
              {editForm.phone.length > 0 && editForm.phone.length < 10 && (
                <p style={{ fontSize: "0.6rem", color: "#ff6666", marginTop: "0.3rem" }}>{10 - editForm.phone.length} more digit{10 - editForm.phone.length !== 1 ? "s" : ""} needed</p>
              )}
            </div>
            <div>
              <label className="form-label">DELIVERY ADDRESS</label>
              <textarea className="form-input" rows={3} value={editForm.address}
                onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                style={{ resize: "none" }} />
            </div>
            {saveError && <p style={{ fontSize: "0.7rem", color: "#ff2d2d" }}>{saveError}</p>}
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: saving ? 0.6 : 1 }} onClick={handleSaveDetails} disabled={saving}>
              <FiSave size={13} /> {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        )}

        {saveSuccess && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#00cc66", fontSize: "0.7rem", marginTop: "0.75rem" }}>
            <FiCheckCircle size={14} /> {saveSuccess}
          </div>
        )}

        <div style={{ ...s.summaryRow, borderTop: "none", paddingTop: 0, marginTop: "1.5rem" }}>
          <div style={{ ...s.summaryBlock, textAlign: "right", flex: "none" }}>
            <div style={s.sectionTitle}>ORDER TOTAL</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#ff2d2d", letterSpacing: "0.05em" }}>₹{order.total}</div>
          </div>
        </div>
      </div>

      <p style={s.helpText}>Questions? DM us on Instagram <strong>@akuma_fits</strong> with your Order ID.</p>
    </div>
  );
}

export default function TrackOrder() {
  const [orderId, setOrderId]   = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSelected(null);

    const data = await trackOrder(email.trim(), orderId.trim());
    setLoading(false);

    if (data.success) {
      if (data.order) {
        setResult({ type: "single", data: data.order });
      } else if (data.orders) {
        setResult(data.orders.length === 1 ? { type: "single", data: data.orders[0] } : { type: "list", data: data.orders });
      }
    } else {
      setError(data.error || "No orders found.");
    }
  };

  const statusColor = (status) =>
    ({ Placed: "#ff9900", Confirmed: "#ff6b00", Shipped: "#4da6ff", Delivered: "#00cc66", Cancelled: "#ff2d2d" }[status] || "#888");

  return (
    <div className="page-wrapper">
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.eyebrow}>ORDER TRACKING</div>
          <h1 style={s.heroTitle}>WHERE'S YOUR DROP?</h1>
          <p style={s.heroSub}>Enter your email — Order ID is optional if you've lost it.</p>
        </div>
      </div>

      <div className="section" style={{ maxWidth: 680, margin: "0 auto" }}>
        <form onSubmit={handleSearch} style={s.form}>
          <div style={s.field}>
            <label className="form-label">EMAIL ADDRESS *</label>
            <input className="form-input" type="email" required placeholder="The email you ordered with" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={s.field}>
            <label className="form-label">
              ORDER ID <span style={{ color: "#444", fontWeight: 400, letterSpacing: "0.05em" }}>(optional — leave blank to see all your orders)</span>
            </label>
            <input className="form-input" placeholder="e.g. AK-M5X2A3-K7P" value={orderId} onChange={(e) => setOrderId(e.target.value)} style={{ letterSpacing: "0.1em" }} />
          </div>
          <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: loading ? 0.6 : 1 }} disabled={loading}>
            <FiSearch size={14} /> {loading ? "SEARCHING..." : "TRACK ORDER"}
          </button>
        </form>

        {error && (
          <div style={s.errorBox}>
            <FiXCircle size={16} color="#ff2d2d" />
            <span>{error}</span>
          </div>
        )}

        {result?.type === "single" && !selected && (
          <OrderDetail order={result.data} email={email} />
        )}

        {result?.type === "list" && selected && (
          <OrderDetail order={selected} email={email} onBack={() => setSelected(null)} />
        )}

        {result?.type === "list" && !selected && (
          <div style={s.resultCard}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={s.resultLabel}>ORDERS FOR</div>
              <div style={s.resultOrderId}>{email}</div>
              <div style={{ fontSize: "0.65rem", color: "#555", marginTop: "0.25rem" }}>{result.data.length} orders found — tap to view details</div>
            </div>
            {result.data.map((order) => (
              <div key={order.orderId} style={s.orderRow} onClick={() => setSelected(order)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", color: "#ff2d2d" }}>{order.orderId}</div>
                  <div style={{ fontSize: "0.6rem", color: "#555", marginTop: "0.2rem" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    &nbsp;•&nbsp; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginRight: "0.75rem" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#f0f0f0" }}>₹{order.total}</div>
                  <span style={{ fontSize: "0.55rem", letterSpacing: "0.12em", fontWeight: 700, color: statusColor(order.status) }}>{order.status.toUpperCase()}</span>
                </div>
                <FiChevronRight size={16} color="#333" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  hero: { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "4rem 1.5rem 3rem" },
  heroInner: { maxWidth: 680, margin: "0 auto" },
  eyebrow: { fontSize: "0.55rem", letterSpacing: "0.35em", color: "#ff2d2d", marginBottom: "0.8rem" },
  heroTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", lineHeight: 1 },
  heroSub: { color: "#666", fontSize: "0.75rem", marginTop: "0.75rem" },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  errorBox: { display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,45,45,0.06)", border: "1px solid rgba(255,45,45,0.2)", padding: "0.9rem 1rem", fontSize: "0.7rem", color: "#ff6666", marginBottom: "2rem" },
  resultCard: { background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", padding: "2rem", marginBottom: "3rem" },
  backBtn: { background: "none", border: "none", color: "#555", fontSize: "0.6rem", letterSpacing: "0.15em", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", padding: 0 },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  resultLabel: { fontSize: "0.5rem", letterSpacing: "0.25em", color: "#444", marginBottom: "0.3rem" },
  resultOrderId: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", color: "#ff2d2d", letterSpacing: "0.1em" },
  resultDate: { fontSize: "0.7rem", color: "#888" },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid", padding: "0.4rem 0.9rem", marginBottom: "0.6rem" },
  statusDesc: { fontSize: "0.7rem", color: "#888", marginBottom: "2rem", lineHeight: 1.7 },
  progressWrap: { display: "flex", alignItems: "flex-start", marginBottom: "2rem", padding: "0 0.5rem" },
  notesBox: { background: "rgba(255,153,0,0.05)", border: "1px solid rgba(255,153,0,0.2)", padding: "0.9rem 1rem", marginBottom: "2rem" },
  notesLabel: { fontSize: "0.5rem", letterSpacing: "0.2em", color: "#ff9900", marginBottom: "0.4rem" },
  notesText: { fontSize: "0.72rem", color: "#ccc", lineHeight: 1.7 },
  itemsSection: { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "0.55rem", letterSpacing: "0.25em", color: "#444", marginBottom: "0.5rem" },
  item: { display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  itemImg: { width: 52, height: 68, objectFit: "cover", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.25rem" },
  itemMeta: { fontSize: "0.6rem", color: "#555", letterSpacing: "0.05em" },
  itemPrice: { fontSize: "0.9rem", color: "#ff2d2d", fontWeight: 700 },
  summaryRow: { display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", marginBottom: "1.5rem" },
  summaryBlock: { flex: 1, minWidth: 160 },
  summaryText: { fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.3rem" },
  summarySubtext: { fontSize: "0.65rem", color: "#666", lineHeight: 1.7 },
  editBtn: { background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: "0.55rem", letterSpacing: "0.15em", padding: "0.3rem 0.7rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", transition: "all 0.2s" },
  editHint: { display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.6rem", color: "#555", marginBottom: "0.75rem", background: "rgba(255,153,0,0.04)", border: "1px solid rgba(255,153,0,0.12)", padding: "0.5rem 0.75rem" },
  helpText: { fontSize: "0.62rem", color: "#444", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "1rem" },
  orderRow: { display: "flex", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" },
};