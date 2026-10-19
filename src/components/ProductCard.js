import { Link } from "react-router-dom";

const tagColors = {
  BESTSELLER: "#ff2d2d",
  "NEW DROP": "#ff6b00",
  HOT: "#ff2d2d",
  LIMITED: "#9b30ff",
  SALE: "#00cc66",
};

export default function ProductCard({ product }) {
  const id = product._id || product.id;
  const outOfStock = product.inStock === false;

  return (
    <Link
      to={`/product/${id}`}
      className="product-card"
      style={{ textDecoration: "none", color: "inherit", opacity: outOfStock ? 0.6 : 1 }}
    >
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
        <div className="product-img-overlay" />
        {product.tag && (
          <span className="tag" style={{ position: "absolute", top: 12, left: 12, background: tagColors[product.tag] || "#ff2d2d" }}>
            {product.tag}
          </span>
        )}
        {outOfStock ? (
          <div style={s.outOfStock}>OUT OF STOCK</div>
        ) : (
          <div className="product-hover-cta">VIEW PRODUCT →</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.category.toUpperCase()}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-pricing">
          <span className="product-price">₹{product.price}</span>
          <span className="product-original">₹{product.originalPrice}</span>
          <span className="product-discount">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        </div>
      </div>
    </Link>
  );
}

const s = {
  outOfStock: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "rgba(0,0,0,0.85)", color: "#888",
    textAlign: "center", padding: "0.75rem",
    fontSize: "0.65rem", letterSpacing: "0.2em", fontWeight: 700,
  },
};