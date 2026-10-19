const items = ["AKUMA FITS", "悪魔", "VILLAIN ARC", "ANIME STREETWEAR", "WEAR YOUR DARK SIDE", "NEW DROPS", "悪魔", "FREE SHIPPING", "240GSM COTTON"];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span key={i} className="marquee-item">
            {t} ✦
          </span>
        ))}
      </div>
    </div>
  );
}