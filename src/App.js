import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnsExchange from "./pages/ReturnsExchange";
import ShippingInfo from "./pages/ShippingInfo";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Admin — no navbar/footer */}
          <Route path="/admin" element={<Admin />} />

          {/* Storefront — with navbar/footer */}
          <Route path="*" element={
            <>
              <Navbar />
              <CartDrawer />
              <Routes>
                <Route path="/"               element={<Home />} />
                <Route path="/shop"           element={<Shop />} />
                <Route path="/product/:id"    element={<ProductDetail />} />
                <Route path="/about"          element={<About />} />
                <Route path="/contact"        element={<Contact />} />
                <Route path="/track-order"       element={<TrackOrder />} />
                <Route path="/privacy-policy"    element={<PrivacyPolicy />} />
                <Route path="/returns-exchange"  element={<ReturnsExchange />} />
                <Route path="/shipping-info"     element={<ShippingInfo />} />
                <Route path="*"                  element={<NotFound />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}