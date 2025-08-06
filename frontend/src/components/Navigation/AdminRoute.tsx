// src/components/Navigation/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AdminRoute() {
  const { userProfile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading user permissions...</div>; // Or a loading spinner
  }

  // If the user is not an admin, redirect them to the homepage.
  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // If the user is an admin, render the nested admin pages.
  return <Outlet />;
}
