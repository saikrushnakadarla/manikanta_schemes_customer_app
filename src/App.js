import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import CustomerRegistration from "./Components/CustomerRegistration/CustomerRegistration";
import CustomerLogin from "./Components/CustomerLogin/CustomerLogin";
import CustomerDashboard from "./Components/CustomerDashboard/CustomerDashboard";
import Schemes from "./Components/Schemes/Schemes";
import Schemesinstallments from "./Components/Schemesinstallments/Schemesinstallments";
import CartPage from "./Components/CartPage/CartPage";
import Products from "./Components/Products/Products";
import ProductDetail from "./Components/Products/ProductDetail";
import HomePage from "./Components/HomePage/HomePage";
import Homeproductdetails from "./Components/HomePage/Homeproductdetails";
import Orders from "./Components/Orders/Orders";
import OrderDetail from "./Components/Orders/OrderDetail";
import AboutUs from "./Components/AboutUs/AboutUs";
import ContactUs from "./Components/ContactUs/ContactUs";
import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
import TermsConditions from "./Components/TermsConditions/TermsConditions";
import OrderConfirmation from "./Components/Products/OrderConfirmation";
import Checkout from "./Components/Products/Checkout";
import WishlistPage from "./Components/WishlistPage/WishlistPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/customerregister" element={<CustomerRegistration />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/schemes" element={<Schemes />} />
        <Route path="/schemesinstallments" element={<Schemesinstallments />} />
        <Route path="/cartpage" element={<CartPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/homeproductdetails/:id" element={<Homeproductdetails />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} /> 
        <Route path="/checkout" element={<Checkout />} /> 
        <Route path="/wishlist" element={<WishlistPage />} />
      </Routes>
    </Router>
  );
}

export default App;