// src/components/Navigation/Sidebar.tsx
import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "../Alerts/NotificationBell"
import { 
  Home, 
  MessageSquare, 
  Star, 
  Calendar, 
  Bell, 
  User, 
  LogOut, 
  Menu,
  Shield, // Icon for Admin
  Stethoscope // Icon for Doctor
} from "lucide-react";

// Define the navigation links for each role
const patientLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/bookings", label: "Bookings", icon: Calendar },
  { path: "/feedback", label: "Feedback", icon: Star },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
];

const doctorLinks = [
  { path: "/doctor/dashboard", label: "Dashboard", icon: Stethoscope },
  { path: "/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { path: "/admin/dashboard", label: "Dashboard", icon: Shield },
  { path: "/profile", label: "Profile", icon: User },
];

// This is the shared navigation content for both mobile and desktop
const NavContent = ({ onLinkClick, navLinks }: { onLinkClick?: () => void; navLinks: typeof patientLinks }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Button
              key={link.label}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onLinkClick}
            >
              <Link to={link.path}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="p-2 border-t">
        <div className="p-3">
            <p className="font-semibold truncate">{userProfile?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};


export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userProfile } = useAuth();

  // useMemo will re-calculate the navLinks only when the user's role changes
  const navLinks = useMemo(() => {
    switch (userProfile?.role) {
      case 'admin':
        return adminLinks;
      case 'doctor':
        return doctorLinks;
      default:
        return patientLinks;
    }
  }, [userProfile?.role]);

  return (
    <>
      {/* Mobile Header & Slide-out Menu */}
      <header className="md:hidden sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
             <div className="p-4 border-b">
                <h1 className="font-bold text-2xl">Smart OPD</h1>
             </div>
             <NavContent navLinks={navLinks} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
         <div className="flex items-center gap-3">
    <h1 className="font-bold text-lg">Smart OPD</h1>
    <NotificationBell />
  </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen bg-background border-r w-64">
         <div className="p-4 border-b flex justify-between items-center">
  <h1 className="font-bold text-2xl">Smart OPD</h1>
  <NotificationBell />
</div>

         <NavContent navLinks={navLinks} />
      </aside>
    </>
  );
}
