import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./page";
import Login from "./login/page";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Store selected edition in state & persist it
  const [selectedEdition, setSelectedEdition] = useState(() => {
    return localStorage.getItem("selectedEdition") || "edicao2";
  });

  // Update localStorage whenever selectedEdition changes
  useEffect(() => {
    localStorage.setItem("selectedEdition", selectedEdition);
  }, [selectedEdition]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Pass selectedEdition and setSelectedEdition to Landing */}
      <Route 
        path="/" 
        element={user ? <Landing selectedEdition={selectedEdition} setSelectedEdition={setSelectedEdition} /> : <Navigate to="/login" replace />} 
      />

      <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppContent;
