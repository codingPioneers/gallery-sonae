import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Page from "./page";
import Login from "./login/page";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? <Page /> : <Navigate to="/login" replace />} />
      <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppContent;
