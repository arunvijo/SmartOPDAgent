import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  MessageSquare,
  Calendar,
  Bell,
  Star,
  User as UserIcon,
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/services/firebase";

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

  useEffect(() => {
    if (!currentUser) return;

    const fetchUpcomingAppointment = async () => {
      const q = query(
        collection(db, "bookings"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "Upcoming"),
        orderBy("date", "asc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setAppointment({ doctor: data.doctor, date: data.date });
      }
    };

    const fetchRecentAlert = async () => {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setAlert({ message: data.message });
      }
    };

    fetchUpcomingAppointment();
    fetchRecentAlert();
  }, [currentUser]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {userProfile?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's your health dashboard for today.
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={(userProfile as any)?.avatarUrl} alt={userProfile?.name} />
          <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
        </Avatar>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* AI Assistant */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              AI Health Assistant
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 pt-2">
              Ask about symptoms or book an appointment — I’m here to assist 24/7.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Let’s chat about your health and get you the care you need.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full md:w-auto">
              <Link to="/chat">
                Chat Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Upcoming Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointment ? (
              <>
                <p className="font-bold text-lg">{appointment.doctor}</p>
                <p className="text-muted-foreground">{appointment.date}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">
                No upcoming appointments.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/bookings">View All Bookings</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Latest Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Latest Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alert ? (
              <p className="font-semibold">{alert.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">
                No new alerts.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/alerts">View All Alerts</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Feedback */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Star size={16} />
              Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Help us improve with your experience.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/feedback">Give Feedback</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Profile */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <UserIcon size={16} />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Manage your details and preferences.
            </p>
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
