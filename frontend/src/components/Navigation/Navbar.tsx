// src/components/Navigation/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext"; // Import the custom hook
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase"; // Import firebase auth instance

export function Navbar() {
  // Get both the auth user and their firestore profile from the context
  const { currentUser, userProfile } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 shadow-md bg-white dark:bg-gray-900">
      <Link to="/" className="text-2xl font-bold text-primary">
        Smart OPD
      </Link>
      
      <div>
        {currentUser ? (
          // If user is logged in, show their name (if available) or email
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {/* Prioritize showing the name, fall back to email */}
              Welcome, {userProfile?.name || currentUser.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          // If user is not logged in, show Login and Sign Up buttons
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
