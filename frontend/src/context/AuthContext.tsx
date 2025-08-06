// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase'; // Ensure path is correct

// Define the structure of the user profile data from Firestore
interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  age?: number;
  insurance?: string;
  avatarUrl?: string; // Add this line
  role: 'patient' | 'doctor' | 'admin'; // Add this line
  status?: 'pending' | 'approved' | 'rejected'; // Add this line for doctors
}

// Define the shape of the context data
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // Add userProfile to the context
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  userProfile: null,
  isLoading: true 
});

// Custom hook to easily use the auth context in other components
export function useAuth() {
  return useContext(AuthContext);
}

// The provider component that will wrap our app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // If user is logged in, fetch their profile document from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null); // No profile doc found
        }
      } else {
        // If user logs out, clear the profile data
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile, // Provide the profile data to the app
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
