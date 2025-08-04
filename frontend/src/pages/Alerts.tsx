import { NotificationPanel } from "@/components/Alerts/NotificationPanel";

export default function AlertsPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <main className="p-6">
          <NotificationPanel />
        </main>
      </div>
    </div>
  );
}
