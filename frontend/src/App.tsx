// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/Navigation/ProtectedRoute";
import { DoctorRoute } from "./components/Navigation/DoctorRoute";
import { AdminRoute } from "./components/Navigation/AdminRoute"; // Import AdminRoute
import { Layout } from "./components/Navigation/Layout";

// Import Pages
import Chat from "./pages/Chat";
import FeedbackPage from "./pages/Feedback";
import Bookings from "./pages/Bookings";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/SignUp";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPendingPage from "./pages/doctor/PendingApproval";
import AdminDashboard from "./pages/admin/AdminDashboard"; // Import Admin Dashboard

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/doctor/pending" element={<DoctorPendingPage />} />

          {/* Patient Routes (Protected) */}
          <Route 
            path="/" 
            element={<ProtectedRoute><Layout /></ProtectedRoute>}
          >
            <Route index element={<HomePage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Doctor Routes (Protected by Role) */}
          <Route 
            path="/doctor" 
            element={<ProtectedRoute><DoctorRoute /></ProtectedRoute>}
          >
            <Route element={<Layout />}>
                <Route path="dashboard" element={<DoctorDashboard />} />
            </Route>
          </Route>

          {/* Admin Routes (Protected by Role) */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute><AdminRoute /></ProtectedRoute>}
          >
            <Route element={<Layout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
