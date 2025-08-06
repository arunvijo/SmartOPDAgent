// src/components/Navigation/DoctorRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function DoctorRoute() {
  const { userProfile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Redirect if user is not a doctor, not approved, or not logged in
  if (userProfile?.role !== 'doctor' || userProfile?.status !== 'approved') {
    // You can redirect to a "Not Authorized" page or back to the homepage
    return <Navigate to="/" />;
  }

  return <Outlet />; // Render the nested doctor routes
}
