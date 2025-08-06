// src/components/Alerts/NotificationBell.tsx

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  message: string;
  createdAt: any;
  read?: boolean;
  status?: string; // 👈 add this line
}


export function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notifs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read || n.status === "UNREAD").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute top-0 right-0 rounded-full px-1.5 text-xs bg-red-600 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h4 className="text-sm font-semibold mb-2">Notifications</h4>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No new notifications</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-auto">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="text-sm p-2 bg-muted rounded-lg border">
                {n.message}
                <div className="text-xs text-muted-foreground mt-1">
                  {n.createdAt?.toDate().toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Export both components
export { NotificationBell as default };
