import { BookingHistory } from "@/components/Bookings/BookingHistory";

export default function BookingsPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <main className="p-6">
          <BookingHistory />
        </main>
      </div>
    </div>
  );
}