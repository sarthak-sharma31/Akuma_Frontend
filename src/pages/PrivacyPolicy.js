export default function PrivacyPolicy() {
  return (
    <div className="page-wrapper">
      <div style={s.hero}>
        <div style={s.eyebrow}>LEGAL</div>
        <h1 style={s.title}>PRIVACY POLICY</h1>
        <p style={s.sub}>Last updated: March 2025</p>
      </div>

      <div style={s.body}>
        <Section title="1. Who We Are">
          AkumaFits is an anime streetwear brand based in India. We operate this website and are responsible for the personal data you share with us when shopping or browsing.
        </Section>

        <Section title="2. What Data We Collect">
          When you place an order, we collect your full name, email address, phone number, and delivery address. We also collect your order history and payment confirmation details. We do not store your card or UPI details — payments are processed securely by Razorpay.
        </Section>

        <Section title="3. How We Use Your Data">
          We use your information solely to process and fulfill your orders, send order confirmations and shipping updates, respond to your queries, and improve our store experience. We do not sell, rent, or share your personal data with third parties for marketing purposes.
        </Section>

        <Section title="4. Payment Security">
          All payments are handled by Razorpay, a PCI-DSS compliant payment gateway. AkumaFits never has access to your card number, CVV, or UPI PIN. For Razorpay's privacy practices, visit razorpay.com/privacy.
        </Section>

        <Section title="5. Order Data Storage">
          Your order information is stored securely on our servers. We retain order data for a minimum of 2 years for legal and accounting compliance.
        </Section>

        <Section title="6. Cookies">
          We use minimal cookies to keep your shopping cart active between sessions. We do not use tracking cookies or third-party advertising cookies.
        </Section>

        <Section title="7. Your Rights">
          You have the right to access, correct, or request deletion of your personal data at any time. To do so, contact us at AkumaFits@gmail.com or via Instagram @Akuma_Fits. We will respond within 7 business days.
        </Section>

        <Section title="8. Third-Party Services">
          We use the following trusted third-party services: Razorpay (payments), Railway (server hosting), and MongoDB Atlas (database). Each operates under their own privacy policy.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this policy as our business grows. Any significant changes will be noted at the top of this page with a revised date. Continued use of our website after changes constitutes acceptance.
        </Section>

        <Section title="10. Contact">
          For any privacy-related questions, email us at AkumaFits@gmail.com or DM us on Instagram @Akuma_Fits.
        </Section>
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
  sub: { color: "#444", fontSize: "0.65rem", marginTop: "0.75rem", letterSpacing: "0.1em" },
  body: { maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 6rem" },
};