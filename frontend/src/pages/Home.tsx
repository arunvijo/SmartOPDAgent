// src/pages/Home.tsx

import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
// FIX: Added CardFooter to the import list
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, MessageSquare, Calendar, Bell, Star, User as UserIcon } from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEffect, useState } from "react";

// Define data structures for our dynamic content
interface UpcomingAppointment {
  doctor: string;
  date: string;
}

interface RecentAlert {
  message: string;
}

export default function HomePage() {
  const { userProfile, currentUser } = useAuth();
  const [appointment, setAppointment] = useState<UpcomingAppointment | null>(null);
  const [alert, setAlert] = useState<RecentAlert | null>(null);

  // DEVELOPER NOTE: To fix the "avatarUrl does not exist" error, 
  // open 'src/context/AuthContext.tsx' and add 'avatarUrl?: string;'
  // to the 'UserProfile' interface definition.

  useEffect(() => {
    // Fetch the single next upcoming appointment
    const fetchUpcomingAppointment = async () => {
      if (!currentUser) return;
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "Upcoming"),
        orderBy("date", "asc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const nextAppt = querySnapshot.docs[0].data();
        setAppointment({ doctor: nextAppt.doctor, date: nextAppt.date });
      }
    };

    // Fetch the single most recent alert
    const fetchRecentAlert = async () => {
      if (!currentUser) return;
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setAlert({ message: querySnapshot.docs[0].data().message });
      }
    };

    fetchUpcomingAppointment();
    fetchRecentAlert();
  }, [currentUser]);

  // Helper function to get initials from a name for the Avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {userProfile?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your health dashboard for today.</p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={(userProfile as any)?.avatarUrl} alt={userProfile?.name} />
          <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
        </Avatar>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Primary Action: Chat with Agent */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageSquare size={24} />
              AI Health Assistant
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 pt-2">
              Have a question? Describe your symptoms or ask to book an appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">I'm here to help you navigate your health journey, 24/7.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full md:w-auto">
              <Link to="/chat">
                Chat Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="text-muted-foreground" />
              Upcoming Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointment ? (
              <div>
                <p className="font-bold text-lg">{appointment.doctor}</p>
                <p className="text-muted-foreground">{appointment.date}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm pt-2">No upcoming appointments.</p>
            )}
          </CardContent>
           <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/bookings">View All Bookings</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="text-muted-foreground" />
              Latest Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alert ? (
              <p className="font-semibold">{alert.message}</p>
            ) : (
              <p className="text-muted-foreground text-sm pt-2">No new alerts.</p>
            )}
          </CardContent>
           <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/alerts">View All Alerts</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Other Actions */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Star size={16}/>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">Share your experience to help us improve.</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                    <Link to="/feedback">Give Feedback</Link>
                </Button>
            </CardFooter>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><UserIcon size={16}/>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">Manage your personal and insurance details.</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                    <Link to="/profile">View Profile</Link>
                </Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
