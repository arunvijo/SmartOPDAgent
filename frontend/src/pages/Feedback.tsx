import { FeedbackForm } from "@/components/Feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <main className="p-6">
          <FeedbackForm />
        </main>
      </div>
    </div>
  );
}