import { useState } from "react";
import { useCart } from "../context/CartContext";
import { FiX, FiArrowRight, FiTruck, FiCheckCircle, FiCopy, FiCreditCard } from "react-icons/fi";
import { RiSkullLine } from "react-icons/ri";
import { createPaymentOrder, verifyPayment } from "../services/api";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, totalPrice, removeFromCart, updateQty, clearCart } = useCart();
  const [step, setStep] = useState("cart"); // cart | form | success
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [copied, setCopied] = useState(false);

  if (!cartOpen) return null;

  const handleClose = () => {
    setCartOpen(false);
    setStep("cart");
    setForm({ name: "", email: "", phone: "", address: "", pincode: "" });
    setError("");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1 — create Razorpay order on backend
      const orderData = await createPaymentOrder(totalPrice);
      if (!orderData.success) throw new Error(orderData.error || "Could not initiate payment");

      // Step 2 — open Razorpay popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AkumaFits",
        description: `${cart.reduce((s, i) => s + i.qty, 0)} item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#ff2d2d" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Try again when ready.");
          },
        },
        handler: async (response) => {
          // Step 3 — verify signature + save order
          const verify = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            customer: { ...form, address: `${form.address}, ${form.pincode}` },
            items: cart.map((item) => ({
              productId: item.itemId || item._id,
              name: item.name,
              image: item.image,
              price: item.price,
              size: item.size,
              qty: item.qty,
            })),
            total: totalPrice,
          });

          if (verify.success) {
            setOrderId(verify.orderId);
            // Fire Facebook Purchase event
            if (window.fbq) {
              window.fbq("track", "Purchase", {
                value: totalPrice,
                currency: "INR",
                content_type: "product",
                contents: cart.map((item) => ({
                  id: item.itemId || item._id,
                  quantity: item.qty,
                })),
              });
            }
            clearCart();
            setStep("success");
          } else {
            setError("Payment received but order saving failed. Please contact us with your payment ID: " + response.razorpay_payment_id);
          }
          setLoading(false);
        },
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>
            {step === "cart"    && <>YOUR CART <span style={{ fontFamily: "'Noto Sans JP'", color: "#ff2d2d", fontSize: "0.9rem" }}>悪魔</span></>}
            {step === "form"    && "CHECKOUT"}
            {step === "success" && "ORDER CONFIRMED!"}
          </h2>
          <button className="modal-close" onClick={handleClose}><FiX size={18} /></button>
        </div>

        {/* ── CART STEP ── */}
        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <div style={s.empty}>
                <RiSkullLine size={56} color="#ff2d2d" style={{ opacity: 0.5 }} />
                <p style={s.emptyText}>Your cart is empty.<br />Embrace the dark side.</p>
                <button className="btn-primary" onClick={handleClose}>SHOP NOW</button>
              </div>
            ) : (
              <>
                <div style={s.items}>
                  {cart.map((item) => (
                    <div key={(item.itemId || item._id) + item.size} style={s.item}>
                      <img src={item.image} alt={item.name} style={s.itemImg} />
                      <div style={s.itemInfo}>
                        <div style={s.itemName}>{item.name}</div>
                        <div style={s.itemSize}>Size: {item.size}</div>
                        <div style={s.itemPrice}>₹{item.price * item.qty}</div>
                      </div>
                      <div style={s.itemActions}>
                        <div style={s.qty}>
                          <button style={s.qtyBtn} onClick={() => updateQty(item.itemId, item.size, -1)}>−</button>
                          <span style={s.qtyNum}>{item.qty}</span>
                          <button style={s.qtyBtn} onClick={() => updateQty(item.itemId, item.size, 1)}>+</button>
                        </div>
                        <button style={s.removeBtn} onClick={() => removeFromCart(item.itemId, item.size)}><FiX size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={s.footer}>
                  <div style={s.total}>
                    <span>TOTAL</span>
                    <span style={{ color: "#ff2d2d" }}>₹{totalPrice}</span>
                  </div>
                  <p style={s.meta}>
                    <FiTruck size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
                    Free shipping &nbsp;•&nbsp; Easy exchange
                  </p>
                  <button className="btn-primary" style={{ width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} onClick={() => setStep("form")}>
                    PROCEED TO CHECKOUT <FiArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── FORM STEP ── */}
        {step === "form" && (
          <div style={{ padding: "1.5rem", overflowY: "auto" }}>
            <p style={{ ...s.meta, marginBottom: "1.5rem" }}>
              Order total: <span style={{ color: "#ff2d2d", fontWeight: 700 }}>₹{totalPrice}</span>
              <span style={{ marginLeft: "0.5rem" }}>({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            </p>

            <form onSubmit={handlePayment}>
              {[
                { label: "Full Name",  key: "name",  type: "text",  placeholder: "Your full name" },
                { label: "Email",      key: "email", type: "email", placeholder: "your@email.com" },
                { label: "Phone",      key: "phone", type: "tel",   placeholder: "10-digit mobile number" },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: "1rem" }}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    type={f.type}
                    required
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    inputMode={f.key === "phone" ? "numeric" : "text"}
                    minLength={f.key === "phone" ? 10 : undefined}
                    maxLength={f.key === "phone" ? 10 : undefined}
                    pattern={f.key === "phone" ? "[0-9]{10}" : undefined}
                    title={f.key === "phone" ? "Enter a valid 10-digit mobile number" : undefined}
                    onChange={(e) => {
                      if (f.key === "phone") {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setForm((p) => ({ ...p, phone: val }));
                      } else {
                        setForm((p) => ({ ...p, [f.key]: e.target.value }));
                      }
                    }}
                  />
                  {f.key === "phone" && form.phone.length > 0 && form.phone.length < 10 && (
                    <p style={{ fontSize: "0.6rem", color: "#ff6666", marginTop: "0.3rem" }}>
                      {10 - form.phone.length} more digit{10 - form.phone.length !== 1 ? "s" : ""} needed
                    </p>
                  )}
                </div>
              ))}

              <div style={{ marginBottom: "1rem" }}>
                <label className="form-label">Delivery Address</label>
                <textarea className="form-input" required rows={3}
                  placeholder="Flat/House No, Street, Area, City, State"
                  value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  style={{ resize: "none" }} />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="form-label">PINCODE *</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  style={{ letterSpacing: "0.15em" }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                    setForm((p) => ({ ...p, pincode: val }));
                  }}
                />
                {form.pincode.length > 0 && form.pincode.length < 6 && (
                  <p style={{ fontSize: "0.6rem", color: "#ff6666", marginTop: "0.3rem" }}>
                    {6 - form.pincode.length} more digit{6 - form.pincode.length !== 1 ? "s" : ""} needed
                  </p>
                )}
              </div>

              {error && <p style={s.errorText}>{error}</p>}

              <p style={{ ...s.meta, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FiCreditCard size={13} /> Secured by Razorpay — UPI, Cards, NetBanking
              </p>

              <button type="submit" className="btn-primary"
                style={{ width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: loading ? 0.6 : 1 }}
                disabled={loading}>
                {loading ? "OPENING PAYMENT..." : `PAY ₹${totalPrice}`}
              </button>

              <button type="button" style={s.backBtn} onClick={() => setStep("cart")}>
                ← BACK TO CART
              </button>
            </form>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <div style={s.success}>
            <FiCheckCircle size={52} color="#00cc66" style={{ opacity: 0.9 }} />
            <h3 style={s.successTitle}>PAYMENT CONFIRMED!</h3>
            <p style={s.successText}>Your order is placed and payment received. We'll ship within 2–3 business days.</p>

            <div style={s.orderIdBox}>
              <div style={s.orderIdLabel}>YOUR ORDER ID</div>
              <div style={s.orderIdValue}>{orderId}</div>
              <button style={s.copyBtn} onClick={copyOrderId}>
                <FiCopy size={12} /> {copied ? "COPIED!" : "COPY"}
              </button>
            </div>

            <p style={s.orderIdNote}>
              Track your order anytime at <strong>/track-order</strong> using this ID + your email.
            </p>

            <button className="btn-primary" onClick={handleClose}>CONTINUE SHOPPING</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Razorpay. Check your internet connection."));
    document.body.appendChild(script);
  });
}

const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "0.5rem" },
  empty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1.2rem" },
  emptyText: { color: "#666", textAlign: "center", fontSize: "0.75rem", lineHeight: 1.8 },
  items: { flex: 1, overflow: "auto", padding: "0.75rem 1.25rem" },
  item: { display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  itemImg: { width: 68, height: 88, objectFit: "cover", flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.3rem", lineHeight: 1.3 },
  itemSize: { fontSize: "0.6rem", color: "#666", letterSpacing: "0.1em", marginBottom: "0.4rem" },
  itemPrice: { fontSize: "0.95rem", color: "#ff2d2d", fontWeight: 700 },
  itemActions: { display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" },
  qty: { display: "flex", alignItems: "center", gap: "0.4rem", border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.5rem" },
  qtyBtn: { background: "none", border: "none", color: "#f0f0f0", fontSize: "1rem", cursor: "pointer", width: 18, textAlign: "center" },
  qtyNum: { fontSize: "0.75rem", minWidth: 18, textAlign: "center" },
  removeBtn: { background: "none", border: "none", color: "#555", cursor: "pointer", transition: "color 0.2s" },
  footer: { padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" },
  total: { display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.5rem" },
  meta: { fontSize: "0.6rem", color: "#555", letterSpacing: "0.08em", marginBottom: "1rem" },
  errorText: { color: "#ff2d2d", fontSize: "0.7rem", marginBottom: "1rem", lineHeight: 1.6 },
  backBtn: { width: "100%", background: "none", border: "none", color: "#555", fontSize: "0.65rem", letterSpacing: "0.15em", cursor: "pointer", textAlign: "center", padding: "0.75rem", marginTop: "0.25rem" },
  success: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", gap: "1rem", textAlign: "center", overflowY: "auto" },
  successTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#00cc66", letterSpacing: "0.06em" },
  successText: { color: "#888", fontSize: "0.75rem", lineHeight: 1.8, maxWidth: 280 },
  orderIdBox: { background: "#0a0a0a", border: "1px solid rgba(0,204,102,0.3)", padding: "1.2rem 1.5rem", width: "100%", textAlign: "center" },
  orderIdLabel: { fontSize: "0.55rem", letterSpacing: "0.25em", color: "#555", marginBottom: "0.5rem" },
  orderIdValue: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: "#ff2d2d", letterSpacing: "0.1em" },
  copyBtn: { display: "inline-flex", alignItems: "center", gap: "0.3rem", marginTop: "0.6rem", background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: "0.55rem", letterSpacing: "0.15em", padding: "0.3rem 0.7rem", cursor: "pointer" },
  orderIdNote: { fontSize: "0.62rem", color: "#555", lineHeight: 1.7, maxWidth: 280 },
};