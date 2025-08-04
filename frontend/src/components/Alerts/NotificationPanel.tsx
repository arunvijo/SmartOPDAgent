// src/components/Alerts/NotificationPanel.tsx

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '../../services/firebase';
import { BellRing, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the structure for a notification document from Firestore
interface Notification {
  id: string;
  message: string;
  createdAt: Timestamp;
  read?: boolean;
}

// A helper function to format the Firestore Timestamp into a readable string
function formatNotificationTime(timestamp: Timestamp): string {
  if (!timestamp) return "Just now";
  const date = timestamp.toDate();
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function NotificationPanel() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only set up the listener if there is a logged-in user
    if (currentUser) {
      setIsLoading(true);
      const notificationsCollection = collection(db, 'notifications');
      
      // Create a query to get notifications for this specific user, ordered by most recent
      const q = query(
        notificationsCollection,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      // onSnapshot creates a real-time listener. This function will be called
      // immediately with the current data, and again any time the data changes.
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userNotifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(userNotifications);
        setIsLoading(false);
      }, (error) => {
        // Handle any errors during the real-time fetch
        console.error("Error fetching notifications in real-time:", error);
        setIsLoading(false);
      });

      // This is a cleanup function. It runs when the component is unmounted
      // to prevent memory leaks by removing the listener.
      return () => unsubscribe();
    } else {
      // If no user is logged in, clear any existing notifications and stop loading.
      setNotifications([]);
      setIsLoading(false);
    }
  }, [currentUser]); // The effect depends on currentUser, so it re-runs if the user logs in or out.

  if (isLoading) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Alerts</h2>
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <BellRing className="h-6 w-6" />
        Your Alerts
      </h2>
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="font-medium">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNotificationTime(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed rounded-lg">
          <Info className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">You have no new alerts.</p>
        </div>
      )}
    </div>
  );
}
