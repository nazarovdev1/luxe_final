import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import LoginForm from '../components/LoginForm';
import AdminDashboard from '../components/AdminDashboard';

const Admin = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
};

export default Admin;
