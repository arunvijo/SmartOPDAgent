// src/components/Navigation/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ensure path is correct

// This component will wrap any page that requires a user to be logged in
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If there is no user, redirect them to the login page
    return <Navigate to="/login" />;
  }

  // If there is a user, render the page they were trying to access
  return <>{children}</>;
}
