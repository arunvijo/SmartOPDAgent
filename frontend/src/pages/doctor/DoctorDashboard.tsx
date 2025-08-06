// src/pages/doctor/DoctorDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// FIX: Removed unused imports like 'collection', 'query', etc.
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Define the structure of a time slot
interface TimeSlot {
  time: string;
  status: 'available' | 'booked' | 'unavailable';
  patientId?: string;
  patientName?: string;
}

// Define the structure of the availability document
interface Availability {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
}

// Sub-component to manage the schedule for a single day
function DailySchedule({ selectedDate, doctorId }: { selectedDate: Date; doctorId: string }) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const availabilityDocRef = doc(db, "availabilities", `${doctorId}_${dateString}`);

  // Fetch the schedule for the selected date
  const fetchSchedule = async () => {
    setIsLoading(true);
    const docSnap = await getDoc(availabilityDocRef);
    if (docSnap.exists()) {
      setAvailability(docSnap.data() as Availability);
    } else {
      setAvailability(null); // No schedule exists for this day
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Re-added fetchSchedule to the dependency array for correctness
    fetchSchedule();
  }, [selectedDate, doctorId]);

  // Function to generate a default schedule for the day
  const generateSchedule = async () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) { // 9 AM to 4 PM
      slots.push({ time: `${String(hour).padStart(2, '0')}:00`, status: 'available' });
      slots.push({ time: `${String(hour).padStart(2, '0')}:30`, status: 'available' });
    }
    const newSchedule: Availability = { doctorId, date: dateString, slots };
    await setDoc(availabilityDocRef, newSchedule);
    setAvailability(newSchedule);
  };

  // Function to toggle a slot's availability
  const toggleSlotStatus = async (slotIndex: number) => {
    if (!availability) return;
    const newSlots = [...availability.slots];
    const currentStatus = newSlots[slotIndex].status;

    // Only allow toggling for non-booked slots
    if (currentStatus !== 'booked') {
      newSlots[slotIndex].status = currentStatus === 'available' ? 'unavailable' : 'available';
      await updateDoc(availabilityDocRef, { slots: newSlots });
      setAvailability(prev => prev ? { ...prev, slots: newSlots } : null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!availability) {
    return (
      <div className="text-center space-y-4 p-8 border-2 border-dashed rounded-lg">
        <p>No schedule has been set for {format(selectedDate, "PPP")}.</p>
        <Button onClick={generateSchedule}>Open Schedule for this Day</Button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Schedule for {format(selectedDate, "PPP")}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availability.slots.map((slot, index) => (
          <Button
            key={index}
            variant={
              slot.status === 'booked' ? 'destructive' :
              slot.status === 'unavailable' ? 'outline' :
              'secondary'
            }
            onClick={() => toggleSlotStatus(index)}
            className="h-12 flex flex-col"
            disabled={slot.status === 'booked'}
          >
            <span className="font-bold">{slot.time}</span>
            <span className="text-xs">{slot.status}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}


export default function DoctorDashboard() {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {userProfile?.name}. Manage your schedule below.</p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader><CardTitle>Select a Date</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="p-0"
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                    />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Schedule Management</CardTitle>
                    <CardDescription>
                        Generate a schedule for a day, then click on available slots to block them for breaks.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedDate && userProfile ? (
                        <DailySchedule selectedDate={selectedDate} doctorId={userProfile.uid} />
                    ) : (
                        <p>Please select a date to view or manage a schedule.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
