// src/pages/SignUp.tsx

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { sendOtp, verifyOtp } from "../services/otpService"; // Import verifyOtp
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Department {
  id: string;
  name: string;
}

type SignupStep = 'details' | 'otp';

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>('details');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      const querySnapshot = await getDocs(collection(db, "departments"));
      const depts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(depts);
    };
    if (role === 'doctor') {
      fetchDepartments();
    }
  }, [role]);

  // Step 1: Validate details and send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (role === 'doctor' && (!selectedDept || !specialization)) {
      setError("Please select a department and enter your specialization.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(email);
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || "An unknown error occurred while sending the OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred while sending the OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and create user
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // First, verify the OTP by calling our new service function
      const verificationResult = await verifyOtp(email, otp);

      if (!verificationResult.success) {
        setError(verificationResult.message || "Invalid OTP. Please try again.");
        setIsLoading(false);
        return; // Stop the process if OTP is incorrect
      }

      // If OTP is correct, proceed to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let userData: any = {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role,
        createdAt: serverTimestamp(),
      };

      if (role === 'doctor') {
        userData = {
          ...userData,
          departmentId: selectedDept,
          specialization: specialization,
          status: 'pending',
        };
      }

      await setDoc(doc(db, "users", user.uid), userData);

      if (role === 'doctor') {
        navigate("/doctor/pending");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      console.error("Error signing up:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already in use. Please go back and log in.");
        setStep('details');
      } else {
        setError("An error occurred during the final sign up step.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          {step === 'otp' && <CardDescription>An OTP has been sent to your email. Please enter it below.</CardDescription>}
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* --- User Details Form (No Changes) --- */}
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {role === 'doctor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                      <SelectTrigger id="department"><SelectValue placeholder="Select your department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Cardiologist" required />
                  </div>
                </>
              )}
              {error && <p className="text-sm font-medium text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Sending OTP..." : "Continue"}</Button>
            </form>
          ) : (
            // --- OTP Verification Form ---
            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="Enter the 6-digit code" maxLength={6} />
                </div>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Verifying & Creating Account..." : "Sign Up"}</Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setStep('details')}>Go Back</Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="font-semibold underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
