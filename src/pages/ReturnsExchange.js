import { FiMail } from "react-icons/fi";

export default function ReturnsExchange() {
  return (
    <div className="page-wrapper">
      <div style={s.hero}>
        <div style={s.eyebrow}>POLICIES</div>
        <h1 style={s.title}>RETURNS & EXCHANGE</h1>
        <p style={s.sub}>We want you to love every piece. Here's how we make it right if you don't.</p>
      </div>

      <div style={s.body}>

        {/* Quick summary cards */}
        <div style={s.cards}>
          {[
            { heading: "7 Days", sub: "Exchange window from delivery date" },
            { heading: "Size Only", sub: "We exchange for size issues, not change of mind" },
            { heading: "Free", sub: "No charge for first exchange on defective items" },
          ].map((c) => (
            <div key={c.heading} style={s.card}>
              <div style={s.cardHeading}>{c.heading}</div>
              <div style={s.cardSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        <Section title="What We Accept">
          We accept exchange requests within 7 days of delivery for the following reasons: wrong size delivered, manufacturing defect (stitching issues, print defect, fabric damage), or wrong item sent. The item must be unworn, unwashed, and have original tags intact.
        </Section>

        <Section title="What We Don't Accept">
          We do not accept returns or exchanges for change of mind, colour appearing slightly different on screen vs real life (this is normal due to monitor calibration), items that have been worn, washed, or altered, or requests raised after 7 days of delivery.
        </Section>

        <Section title="No Refunds Policy">
          Since AkumaFits operates on a made-to-order dropshipping model, we do not offer cash refunds. All eligible issues are resolved via size exchange or store credit. In rare cases of a severe defect where exchange is not possible, we will issue full store credit.
        </Section>

        <Section title="How to Request an Exchange">
          To start an exchange, DM us on Instagram @Akuma_Fits or email us at AkumaFits@gmail.com within 7 days of receiving your order. Include your Order ID, a clear photo of the item showing the issue, and your preferred replacement size. We will respond within 24–48 hours with the next steps.
        </Section>

        <Section title="Shipping for Exchange">
          For defective or wrong items, we will cover the reverse pickup cost. For size exchanges (where the correct size was delivered), the customer bears the return shipping cost. Once we receive the item back, we will dispatch the replacement within 3–5 business days.
        </Section>

        <Section title="Cancellations">
          Orders can be cancelled within 2 hours of placement by contacting us immediately on Instagram or email. After 2 hours, the order is likely already processed with our supplier and cannot be cancelled. Once shipped, cancellation is not possible.
        </Section>

        <div style={s.contact}>
          <FiMail size={20} color="#ff2d2d" />
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.3rem" }}>Need help with an order?</div>
            <div style={{ fontSize: "0.65rem", color: "#666" }}>Email AkumaFits@gmail.com or DM @Akuma_Fits on Instagram. We typically respond within 24 hours.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.08em", color: "#ff2d2d", marginBottom: "0.75rem" }}>{title}</h2>
      <p style={{ color: "#888", fontSize: "0.78rem", lineHeight: 2 }}>{children}</p>
    </div>
  );
}

const s = {
  hero: { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "5rem 2rem 3rem", maxWidth: 760, margin: "0 auto" },
  eyebrow: { fontSize: "0.55rem", letterSpacing: "0.35em", color: "#ff2d2d", marginBottom: "0.8rem" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.04em", lineHeight: 1 },
  sub: { color: "#888", fontSize: "0.75rem", marginTop: "0.75rem", lineHeight: 1.7, maxWidth: 480 },
  body: { maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 6rem" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "3rem" },
  card: { background: "#0a0a0a", border: "1px solid rgba(255,45,45,0.15)", padding: "1.5rem", textAlign: "center" },
  cardHeading: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#ff2d2d", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "0.4rem" },
  cardSub: { fontSize: "0.62rem", color: "#666", letterSpacing: "0.08em", lineHeight: 1.6 },
  contact: { display: "flex", gap: "1rem", alignItems: "flex-start", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", marginTop: "1rem" },
};