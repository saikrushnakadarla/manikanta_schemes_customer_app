// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import './App.css';
// import CustomerRegistration from "./Components/CustomerRegistration/CustomerRegistration";
// import CustomerLogin from "./Components/CustomerLogin/CustomerLogin";
// import CustomerDashboard from "./Components/CustomerDashboard/CustomerDashboard";
// import Schemes from "./Components/Schemes/Schemes";
// import Schemesinstallments from "./Components/Schemesinstallments/Schemesinstallments";
// import CartPage from "./Components/CartPage/CartPage";
// import Products from "./Components/Products/Products";
// import ProductDetail from "./Components/Products/ProductDetail";
// import HomePage from "./Components/HomePage/HomePage";
// import Homeproductdetails from "./Components/HomePage/Homeproductdetails";
// import Orders from "./Components/Orders/Orders";
// import OrderDetail from "./Components/Orders/OrderDetail";
// import AboutUs from "./Components/AboutUs/AboutUs";
// import ContactUs from "./Components/ContactUs/ContactUs";
// import PrivacyPolicy from "./Components/PrivacyPolicy/PrivacyPolicy";
// import TermsConditions from "./Components/TermsConditions/TermsConditions";
// import OrderConfirmation from "./Components/Products/OrderConfirmation";
// import Checkout from "./Components/Products/Checkout";
// import WishlistPage from "./Components/WishlistPage/WishlistPage";
// import AllSchemes from "./Components/AllSchemes/AllSchemes";
// import SchemeDetails from "./Components/AllSchemes/SchemeDetails";
// import ShippingPolocy from "./Components/ShippingPolocy/ShippingPolicy";
// import ReturnPolocy from "./Components/ReturnPolocy/ReturnPolicy";
// import ReturnPolicy from "./Components/ReturnPolocy/ReturnPolicy";
// import ShippingPolicy from "./Components/ShippingPolocy/ShippingPolicy";
// import Profile from "./Components/Profile/Profile";
// import Profileform from "./Components/Profile/Profileform";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/customerregister" element={<CustomerRegistration />} />
//         <Route path="/login" element={<CustomerLogin />} />
//         <Route path="/dashboard" element={<CustomerDashboard />} />
//         <Route path="/schemes" element={<Schemes />} />
//         <Route path="/schemesinstallments" element={<Schemesinstallments />} />
//         <Route path="/cartpage" element={<CartPage />} />
//         <Route path="/products" element={<Products />} />
//         <Route path="/product/:id" element={<ProductDetail />} />
//         <Route path="/" element={<HomePage />} />
//         <Route path="/homeproductdetails/:id" element={<Homeproductdetails />} />
//         <Route path="/orders" element={<Orders />} />
//         <Route path="/order/:id" element={<OrderDetail />} />
//         <Route path="/order-confirmation" element={<OrderConfirmation />} />
//         <Route path="/about" element={<AboutUs />} />
//         <Route path="/contact" element={<ContactUs />} />
//         <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//         <Route path="/terms-conditions" element={<TermsConditions />} />  
//         <Route path="/return-policy" element={<ReturnPolicy />} /> 
//         <Route path="/shipping-policy" element={<ShippingPolicy />} />
//         <Route path="/checkout" element={<Checkout />} /> 
//         <Route path="/wishlist" element={<WishlistPage />} /> 
//         <Route path="/allschemes" element={<AllSchemes />} /> 
//         <Route path="/schemesdetails/:id" element={<SchemeDetails />} /> 
//          <Route path="/profile" element={<Profile />} /> 
//           <Route path="/edit-profile" element={<Profileform />} /> 
//       </Routes>
//     </Router>
//   );
// }

// export default App; 



import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
import AllSchemes from "./Components/AllSchemes/AllSchemes";
import SchemeDetails from "./Components/AllSchemes/SchemeDetails";
import ReturnPolicy from "./Components/ReturnPolocy/ReturnPolicy";
import ShippingPolicy from "./Components/ShippingPolocy/ShippingPolicy";
import Profile from "./Components/Profile/Profile";
import { isLoggedIn } from "./Components/Navbar/NavConfig"; // adjust path to where NavConfig.js lives
import Profileform from "./Components/Profile/Profileform";
import Schemeinstallmentpayments from "./Components/AllSchemes/Schemeinstallmentpayments";

// Only logged-in users can open the wrapped page; guests are sent to `to`.
const RequireLogin = ({ children, to = "/login" }) =>
  isLoggedIn() ? children : <Navigate to={to} replace />;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/homeproductdetails/:id" element={<Homeproductdetails />} />
        <Route path="/customerregister" element={<CustomerRegistration />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />

        {/* Members only: guests go back to the guest home */}
        <Route path="/products" element={<RequireLogin to="/"><Products /></RequireLogin>} />
        <Route path="/product/:id" element={<RequireLogin to="/"><ProductDetail /></RequireLogin>} />

        {/* Members only: guests see the locked profile */}
        <Route path="/profile" element={<RequireLogin to="/?profile=1"><Profile /></RequireLogin>} />

        {/* Members only: guests are sent to login */}
        <Route path="/dashboard" element={<RequireLogin><CustomerDashboard /></RequireLogin>} />
        <Route path="/schemes" element={<RequireLogin><Schemes /></RequireLogin>} />
        <Route path="/schemesinstallments" element={<RequireLogin><Schemesinstallments /></RequireLogin>} />
        <Route path="/allschemes" element={<RequireLogin><AllSchemes /></RequireLogin>} />
        <Route path="/schemesdetails/:id" element={<RequireLogin><SchemeDetails /></RequireLogin>} />
        <Route path="/cartpage" element={<RequireLogin><CartPage /></RequireLogin>} />
        <Route path="/wishlist" element={<RequireLogin><WishlistPage /></RequireLogin>} />
        <Route path="/checkout" element={<RequireLogin><Checkout /></RequireLogin>} />
        <Route path="/orders" element={<RequireLogin><Orders /></RequireLogin>} />
        <Route path="/order/:id" element={<RequireLogin><OrderDetail /></RequireLogin>} />
        <Route path="/order-confirmation" element={<RequireLogin><OrderConfirmation /></RequireLogin>} /> 
         <Route path="/edit-profile" element={<Profileform />} /> 
         <Route path="/payment-history" element={<Schemeinstallmentpayments />} />
         <Route path="/payment-history/:id" element={<Schemeinstallmentpayments />} />
      </Routes>
    </Router>
  );
}

export default App;