// src/components/Bookings/BookingHistory.tsx

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../services/firebase"; // Make sure the path to firebase.ts is correct
// NEW CODE - FIXES THE ERROR
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

// Define a type for your booking data from Firestore
interface Booking {
  id: string; // The document ID from Firestore
  doctor: string;
  date: string;
  status: "Completed" | "Upcoming" | "Cancelled";
  // Add any other fields you store in the database
}

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // onAuthStateChanged is the best way to get the current user
    // It runs once on load, and again if the user logs in or out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    
    // Cleanup function to prevent memory leaks
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This effect runs when the component loads OR when the currentUser changes
    if (currentUser) {
      const fetchBookings = async () => {
        setIsLoading(true);
        try {
          // Create a query to get documents from the 'bookings' collection
          // where the 'userId' field matches the current user's ID (uid)
          const bookingsCollection = collection(db, "bookings");
          const q = query(
            bookingsCollection, 
            where("userId", "==", currentUser.uid),
            orderBy("date", "desc") // Optional: show newest bookings first
          );

          const querySnapshot = await getDocs(q);
          
          const userBookings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Booking[];

          setBookings(userBookings);
        } catch (error) {
          console.error("Error fetching bookings: ", error);
          // Optionally set an error state to show a message to the user
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookings();
    } else {
      // If there's no user, clear bookings and stop loading
      setBookings([]);
      setIsLoading(false);
    }
  }, [currentUser]); // The dependency array ensures this runs when the user state changes

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Loading your booking history...</p>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
        <div className="text-center p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="font-semibold">Please log in to view your booking history.</p>
        </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold">Booking History</h2>
        <p className="mt-2 text-muted-foreground">You have no bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Booking History</h2>
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="p-3 border rounded-xl">
            <p className="font-medium">{b.doctor}</p>
            <p className="text-sm text-muted-foreground">{b.date} - {b.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}