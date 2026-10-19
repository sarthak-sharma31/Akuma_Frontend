const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Low-level fetch helpers ──

const get = (url) =>
  fetch(`${BASE}${url}`).then((r) => r.json());

const authHeaders = (password) => ({
  "Content-Type": "application/json",
  "x-admin-password": password,
});

const post = (url, body, password) =>
  fetch(`${BASE}${url}`, {
    method: "POST",
    headers: authHeaders(password),
    body: JSON.stringify(body),
  }).then((r) => r.json());

const put = (url, body, password) =>
  fetch(`${BASE}${url}`, {
    method: "PUT",
    headers: authHeaders(password),
    body: JSON.stringify(body),
  }).then((r) => r.json());

const patch = (url, password) =>
  fetch(`${BASE}${url}`, {
    method: "PATCH",
    headers: authHeaders(password),
  }).then((r) => r.json());

const del = (url, password) =>
  fetch(`${BASE}${url}`, {
    method: "DELETE",
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

// ─────────────────────────────────────────────
// PUBLIC API  →  /api/products
// ─────────────────────────────────────────────

export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return get(`/api/products${query ? `?${query}` : ""}`);
};

export const getProduct = (id) =>
  get(`/api/products/${id}`);

// ─────────────────────────────────────────────
// ADMIN API  →  /api/admin
// ─────────────────────────────────────────────

export const verifyAdmin = (password) =>
  post("/api/admin/verify", {}, password);

export const getAdminProducts = (password) =>
  fetch(`${BASE}/api/admin/products`, {
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

export const createProduct = (data, password) =>
  post("/api/admin/products", data, password);

export const updateProduct = (id, data, password) =>
  put(`/api/admin/products/${id}`, data, password);

export const deleteProduct = (id, password) =>
  del(`/api/admin/products/${id}`, password);

export const toggleVisible = (id, password) =>
  patch(`/api/admin/products/${id}/toggle-visible`, password);

export const toggleStock = (id, password) =>
  patch(`/api/admin/products/${id}/toggle-stock`, password);

export const toggleFeatured = (id, password) =>
  patch(`/api/admin/products/${id}/toggle-featured`, password);

// ─────────────────────────────────────────────
// ORDERS API  →  /api/orders
// ─────────────────────────────────────────────

export const placeOrder = (orderData) =>
  fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  }).then((r) => r.json());

export const updateOrderDetails = (orderId, email, details) =>
  fetch(`${BASE}/api/orders/update-details`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, email, ...details }),
  }).then((r) => r.json());

export const trackOrder = (email, orderId = "") => {
  const params = new URLSearchParams({ email });
  if (orderId) params.set("orderId", orderId);
  return get(`/api/orders/track?${params.toString()}`);
};

// ─────────────────────────────────────────────
// ADMIN ORDERS API  →  /api/admin/orders
// ─────────────────────────────────────────────

export const getAdminOrders = (password, status = "") =>
  fetch(`${BASE}/api/admin/orders${status ? `?status=${status}` : ""}`, {
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

export const updateOrderStatus = (orderId, data, password) =>
  fetch(`${BASE}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-admin-password": password },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// ─────────────────────────────────────────────
// PAYMENT API  →  /api/payment
// ─────────────────────────────────────────────

export const createPaymentOrder = (amount) =>
  fetch(`${BASE}/api/payment/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  }).then((r) => r.json());

export const verifyPayment = (payload) =>
  fetch(`${BASE}/api/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

// ─────────────────────────────────────────────
// PINCODE SERVICEABILITY  →  Shiprocket API
// ─────────────────────────────────────────────

export const checkPincode = async (pincode) => {
  try {
    // Shiprocket pincode serviceability check
    // Docs: https://apidocs.shiprocket.in/#pincode-serviceability
    const token = process.env.REACT_APP_SHIPROCKET_TOKEN;

    if (!token) {
      // Fallback: basic Indian pincode format validation only
      const valid = /^[1-9][0-9]{5}$/.test(pincode);
      return { available: valid, message: valid ? "Pincode looks valid — full serviceability check coming soon." : "Invalid pincode format." };
    }

    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=110001&delivery_postcode=${pincode}&cod=0&weight=0.5`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    const data = await res.json();

    if (data.status === 200 && data.data?.available_courier_companies?.length > 0) {
      return { available: true, message: "Delivery available at this pincode!" };
    } else {
      return { available: false, message: "Sorry, delivery is not available at this pincode." };
    }
  } catch {
    return { available: null, message: "Could not check pincode. Please try again." };
  }
};

// ─────────────────────────────────────────────
// REVIEWS API
// ─────────────────────────────────────────────

export const getReviews = (productId) =>
  get(`/api/reviews/${productId}`);

export const getAdminReviews = (productId, password) =>
  fetch(`${BASE}/api/admin/reviews/${productId}`, {
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

export const createReview = (data, password) =>
  fetch(`${BASE}/api/admin/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": password },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateReview = (id, data, password) =>
  fetch(`${BASE}/api/admin/reviews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-password": password },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteReview = (id, password) =>
  fetch(`${BASE}/api/admin/reviews/${id}`, {
    method: "DELETE",
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

// ─────────────────────────────────────────────
// CLOUDINARY UPLOAD
// ─────────────────────────────────────────────
export const uploadToCloudinary = async (file) => {
  const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary env vars missing:", { CLOUD_NAME, UPLOAD_PRESET });
    return { success: false, error: "Image upload not configured. Please add your photo after submitting." };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "akumafits/reviews");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) return { success: true, url: data.secure_url };
    console.error("Cloudinary error:", data);
    return { success: false, error: data.error?.message || "Upload failed" };
  } catch (err) {
    console.error("Upload exception:", err);
    return { success: false, error: "Network error during upload. Try again." };
  }
};

// Customer submit review
export const submitReview = (data) =>
  fetch(`${BASE}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// Admin approve review
export const approveReview = (id, password) =>
  fetch(`${BASE}/api/admin/reviews/${id}/approve`, {
    method: "PATCH",
    headers: { "x-admin-password": password },
  }).then((r) => r.json());

// Admin get pending reviews
export const getPendingReviews = (password) =>
  fetch(`${BASE}/api/admin/reviews/pending`, {
    headers: { "x-admin-password": password },
  }).then((r) => r.json());