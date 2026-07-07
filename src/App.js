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
      </Routes>
    </Router>
  );
}

export default App;