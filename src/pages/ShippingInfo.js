import { FiTruck, FiClock, FiMapPin, FiPhone } from "react-icons/fi";

export default function ShippingInfo() {
  return (
    <div className="page-wrapper">
      <div style={s.hero}>
        <div style={s.eyebrow}>SHIPPING</div>
        <h1 style={s.title}>SHIPPING INFO</h1>
        <p style={s.sub}>Free pan-India shipping on every order. No minimums, no hidden charges.</p>
      </div>

      <div style={s.body}>

        {/* Quick info cards */}
        <div style={s.cards}>
          {[
            { icon: <FiTruck size={22} color="#ff2d2d" />, heading: "Free Shipping", sub: "On all orders across India" },
            { icon: <FiClock size={22} color="#ff2d2d" />, heading: "5–8 Days", sub: "Estimated delivery after dispatch" },
            { icon: <FiMapPin size={22} color="#ff2d2d" />, heading: "Pan India", sub: "We deliver to all 28 states & 8 UTs" },
          ].map((c) => (
            <div key={c.heading} style={s.card}>
              <div style={{ marginBottom: "0.75rem" }}>{c.icon}</div>
              <div style={s.cardHeading}>{c.heading}</div>
              <div style={s.cardSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        <Section title="Processing Time">
          After your payment is confirmed, we process and place your order with our fulfillment partner within 24 hours on business days. Orders placed on Sunday or public holidays are processed the next business day. You will receive an order confirmation with your Order ID immediately after payment.
        </Section>

        <Section title="Delivery Timeline">
          Once dispatched, orders typically arrive within 5–8 business days depending on your location. Metro cities (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune) usually receive orders in 3–5 days. Tier 2 and Tier 3 cities and rural areas may take up to 8–10 days. These are estimates and not guaranteed — actual delivery may vary based on courier load and local conditions.
        </Section>

        <Section title="Tracking Your Order">
          Once your order is shipped, we will update your order status to "Shipped" in our system. You can track your order anytime using the track-order section by using your Order ID and email. If a tracking number is available from the courier, we will add it as a note on your order which you can see on the tracking page.
        </Section>

        <Section title="Shipping Partners">
          We ship via trusted Indian logistics partners including Delhivery, Shiprocket, and Xpressbees depending on your pincode and availability. We do not currently offer express or same-day shipping.
        </Section>

        <Section title="Delivery Attempts">
          Our courier partners will attempt delivery up to 3 times. If all 3 attempts fail (no one available to receive), the package is returned to us. In such cases, re-shipping charges of ₹80–120 will apply for a second delivery attempt. Please ensure your phone number is correct so the courier can reach you.
        </Section>

        <Section title="Undeliverable Areas">
          We currently ship to all serviceable pincodes across India. In rare cases where your pincode is not serviceable by our courier partners, we will notify you and offer a full refund or alternate arrangement.
        </Section>

        <Section title="Damaged in Transit">
          If your order arrives visibly damaged, please take a photo or video of the sealed package before opening it, and another after opening showing the damage. Contact us within 48 hours of delivery at AkumaFits@gmail.com with your Order ID and photos. We will arrange a replacement at no extra cost.
        </Section>

        <div style={s.contact}>
          <FiPhone size={20} color="#ff2d2d" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.3rem" }}>Shipping query?</div>
            <div style={{ fontSize: "0.65rem", color: "#666", lineHeight: 1.8 }}>
              DM us on Instagram @Akuma_Fits or email AkumaFits@gmail.com with your Order ID. We'll get back to you within 24 hours on business days.
            </div>
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
  cardHeading: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#f0f0f0", letterSpacing: "0.05em", lineHeight: 1, marginBottom: "0.4rem" },
  cardSub: { fontSize: "0.62rem", color: "#666", letterSpacing: "0.08em", lineHeight: 1.6 },
  contact: { display: "flex", gap: "1rem", alignItems: "flex-start", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", marginTop: "1rem" },
};