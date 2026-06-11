import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import CustomerRegistration from "./Components/CustomerRegistration/CustomerRegistration";
import CustomerLogin from "./Components/CustomerLogin/CustomerLogin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/customerregister" element={<CustomerRegistration />} />
        <Route path="/" element={<CustomerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;