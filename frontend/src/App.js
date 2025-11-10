import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import AddContent from "./pages/AddContent";
import EnhancedContentDetails from "./pages/EnhancedContentDetails";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddContent />} />
          <Route path="/content/:id" element={<EnhancedContentDetails />} />
          <Route path="/share/:shareId" element={<EnhancedContentDetails />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;