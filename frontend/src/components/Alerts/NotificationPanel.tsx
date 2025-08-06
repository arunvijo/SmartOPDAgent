import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Info, CheckCircle, MailOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  message: string;
  createdAt: any;
  read?: boolean;
  status?: string;
}

export function NotificationPanel() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notifs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAsRead = async (notif: Notification) => {
    if (notif.read) return;
    const notifRef = doc(db, "notifications", notif.id);
    await updateDoc(notifRef, { read: true });
  };

  const getIcon = (message: string, read?: boolean) => {
    if (message.toLowerCase().includes("appointment"))
      return <Bell className="h-5 w-5 text-primary" />;
    if (message.toLowerCase().includes("alert"))
      return <Info className="h-5 w-5 text-orange-500" />;
    return read
      ? <MailOpen className="h-5 w-5 text-muted-foreground" />
      : <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const filteredNotifs =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(val) => setFilter((val as "all" | "unread") || "all")}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        ) : filteredNotifs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications found.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {filteredNotifs.map((n) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                      !n.read
                        ? "bg-muted border-primary/50 shadow"
                        : "bg-muted/60 border-border"
                    } hover:bg-muted/80`}
                    onClick={() => handleMarkAsRead(n)}
                  >
                    <div className="pt-1">{getIcon(n.message, n.read)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.message}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {n.createdAt?.toDate().toLocaleString()}
                      </div>
                    </div>
                    {!n.read && (
                      <Badge variant="outline" className="text-xs mt-1">
                        New
                      </Badge>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
