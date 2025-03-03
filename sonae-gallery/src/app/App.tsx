"use client"; 
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./page";
import Login from "./login/page";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? <Landing /> : <Navigate to="/login" replace />} />
      <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
