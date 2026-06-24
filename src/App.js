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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/customerregister" element={<CustomerRegistration />} />
        <Route path="/" element={<CustomerLogin />} /> 
        <Route path="/dashboard" element={<CustomerDashboard />} /> 
         <Route path="/schemes" element={<Schemes />} /> 
         <Route path="/schemesinstallments" element={<Schemesinstallments />} />
      </Routes>
    </Router>
  );
}

export default App;