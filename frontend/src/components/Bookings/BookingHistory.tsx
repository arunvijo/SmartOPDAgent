// src/components/Bookings/BookingHistory.tsx

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Booking type based on your Firestore data
interface Booking {
  id: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "COMPLETED" | "UPCOMING" | "CANCELLED";
}

export function BookingHistory() {
  const { currentUser, isLoading: authLoading } = useAuth(); // ✅ use AuthContext
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("patientId", "==", currentUser.uid),
          orderBy("appointmentDate", "desc")
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            doctorName: data.doctorName,
            appointmentDate: data.appointmentDate,
            appointmentTime: data.appointmentTime,
            status: data.status.toUpperCase(),
          };
        }) as Booking[];

        setBookings(results);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchBookings();
    } else {
      setBookings([]);
      setIsLoading(false);
    }
  }, [currentUser]);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card className="text-center p-6 bg-yellow-50 border border-yellow-300">
        <p className="font-semibold text-yellow-700">
          Please log in to view your booking history.
        </p>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold">Booking History</h2>
        <p className="mt-2 text-muted-foreground">You have no bookings yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Booking History</h2>
      <Separator />
      <ul className="space-y-4">
        {bookings.map((b) => (
          <Card key={b.id} className="p-4">
            <CardContent className="p-0 space-y-1">
              <p className="font-medium text-lg">{b.doctorName}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(b.appointmentDate), "dd MMM yyyy")} at {b.appointmentTime}
              </p>
              <p
                className={`text-sm font-semibold ${
                  b.status === "COMPLETED"
                    ? "text-green-600"
                    : b.status === "CANCELLED"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {b.status}
              </p>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  );
}
