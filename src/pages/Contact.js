import { useState, useRef } from "react";
import { FiMail, FiInstagram, FiMapPin, FiClock, FiArrowRight, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { useWindowSize } from "../hooks/useWindowSize";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE  = "service_1cbxjes";
const EMAILJS_TEMPLATE = "template_pzn5r5e";
const EMAILJS_KEY      = "RJTlYJ4GCd6dot2JI";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { isTablet } = useWindowSize();
  const formRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await emailjs.sendForm(EMAILJS_SERVICE, EMAILJS_TEMPLATE, formRef.current, EMAILJS_KEY);
      setSent(true);
    } catch (err) {
      setError("Failed to send message. Please DM us on Instagram @akuma_fits instead.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={s.header}>
        <div className="eyebrow" style={{ marginBottom: "0.8rem" }}>Get In Touch</div>
        <h1 style={s.title}>CONTACT US</h1>
        <p style={s.sub}>Questions, collabs, or just vibes? We're here.</p>
      </div>

      <div className="section">
        <div style={{ ...s.layout, flexDirection: isTablet ? "column" : "row", gap: isTablet ? "3rem" : "5rem" }}>

          {/* Info */}
          <div style={{ ...s.infoCol, flex: isTablet ? "none" : "0 0 38%" }}>
            <h2 style={s.infoTitle}>LET'S TALK</h2>
            <p style={s.infoText}>
              For order issues, size exchanges, or any questions about AkumaFits — reach out below. We reply within 24 hours.
            </p>
            <div style={s.contacts}>
              {[
                { icon: <FiMail size={16} color="#ff2d2d" />,      label: "EMAIL",      val: "akumafits@gmail.com" },
                { icon: <FiInstagram size={16} color="#ff2d2d" />, label: "INSTAGRAM",  val: "@akuma_fits" },
                { icon: <FiMapPin size={16} color="#ff2d2d" />,    label: "BASED IN",   val: "India" },
                { icon: <FiClock size={16} color="#ff2d2d" />,     label: "REPLY TIME", val: "Within 24 hours" },
              ].map((c) => (
                <div key={c.label} style={s.contactItem}>
                  <span style={s.contactIcon}>{c.icon}</span>
                  <div>
                    <div style={s.contactLabel}>{c.label}</div>
                    <div style={s.contactVal}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
            {!isTablet && <div style={s.kanjiDeco}>悪魔</div>}
          </div>

          {/* Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {sent ? (
              <div style={s.successBox}>
                <FiCheckCircle size={52} color="#ff2d2d" style={{ marginBottom: "1rem", opacity: 0.85 }} />
                <h3 style={s.successTitle}>MESSAGE RECEIVED</h3>
                <p style={s.successText}>Welcome to the dark side. We'll reply to <strong>{form.email}</strong> within 24 hours.</p>
                <button className="btn-outline" style={{ marginTop: "1.5rem" }} onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit}>
                <h3 style={s.formTitle}>SEND A MESSAGE</h3>
                {[
                  { label: "Your Name",      key: "name",    type: "text",  placeholder: "Full name" },
                  { label: "Email Address",  key: "email",   type: "email", placeholder: "your@email.com" },
                  { label: "Subject",        key: "subject", type: "text",  placeholder: "Order issue / Collab / General" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: "1.2rem" }}>
                    <label className="form-label">{f.label}</label>
                    <input
                      className="form-input"
                      type={f.type}
                      name={f.key}
                      required
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input form-textarea"
                    name="message"
                    required
                    placeholder="Tell us what's up..."
                    value={form.message}
                    rows={5}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  />
                </div>

                {error && (
                  <p style={{ color: "#ff2d2d", fontSize: "0.7rem", marginBottom: "1rem", lineHeight: 1.6 }}>{error}</p>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: sending ? 0.6 : 1 }}
                  disabled={sending}
                >
                  {sending
                    ? <><FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> SENDING...</>
                    : <><FiArrowRight size={14} /> SEND MESSAGE</>
                  }
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { background: "linear-gradient(180deg, rgba(255,45,45,0.07) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,45,45,0.12)", padding: "5rem 1.5rem 3.5rem", textAlign: "center" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "0.05em", marginBottom: "0.5rem" },
  sub: { color: "#666", fontSize: "0.75rem", letterSpacing: "0.18em" },
  layout: { display: "flex", flexWrap: "wrap" },
  infoCol: { position: "relative", minWidth: 260 },
  infoTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.05em", marginBottom: "1rem" },
  infoText: { color: "#888", fontSize: "0.78rem", lineHeight: 1.9, marginBottom: "2rem" },
  contacts: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  contactItem: { display: "flex", alignItems: "center", gap: "1rem" },
  contactIcon: { width: 36, display: "flex", justifyContent: "center", flexShrink: 0 },
  contactLabel: { fontSize: "0.55rem", letterSpacing: "0.25em", color: "#ff2d2d", marginBottom: "0.1rem" },
  contactVal: { fontSize: "0.75rem", color: "#aaa" },
  kanjiDeco: { fontFamily: "'Noto Sans JP', sans-serif", fontSize: "6rem", color: "#ff2d2d", opacity: 0.07, position: "absolute", bottom: 0, right: 0, lineHeight: 1, pointerEvents: "none" },
  formTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.8rem", letterSpacing: "0.06em", marginBottom: "2rem" },
  successBox: { background: "#0f0f0f", border: "1px solid rgba(255,45,45,0.2)", padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
  successTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#ff2d2d", letterSpacing: "0.06em", marginBottom: "0.5rem" },
  successText: { color: "#888", fontSize: "0.75rem", lineHeight: 1.8 },
};