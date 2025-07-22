import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="text-center mt-5">⏳ Chargement...</div>;
  }

  if (!user || !user.email.endsWith('@wave.com')) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;