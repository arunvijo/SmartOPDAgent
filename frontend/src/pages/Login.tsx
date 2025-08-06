// src/pages/Login.tsx

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import getDoc
import { auth, db } from "../services/firebase"; // Ensure this path is correct
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After successful login, fetch the user's document to check their role
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Redirect based on the user's role
        switch (userData.role) {
          case 'admin':
            navigate("/admin/dashboard");
            break;
          case 'doctor':
            if (userData.status === 'approved') {
              navigate("/doctor/dashboard");
            } else {
              navigate("/doctor/pending");
            }
            break;
          default: // 'patient' or any other role
            navigate("/");
            break;
        }
      } else {
        // This is a fallback in case the user doc doesn't exist
        console.error("No user document found in Firestore!");
        navigate("/");
      }

    } catch (err: any) {
      console.error("Error logging in:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Login to access your health dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold underline">
              Sign up
            </Link>
          </div>
          
          <Separator className="my-6" />

          <div className="text-center">
             <p className="text-sm text-muted-foreground mb-2">For staff and administration</p>
             <Button asChild variant="secondary" className="w-full">
                <Link to="/login">
                    Admin / Doctor Login
                </Link>
            </Button>
          </div>

        </CardContent>
      </Card>
    </main>
  );
}
