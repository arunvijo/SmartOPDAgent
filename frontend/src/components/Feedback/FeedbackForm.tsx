// src/components/Feedback/FeedbackForm.tsx

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase"; // Ensure this path is correct
// NEW CODE - FIXES THE ERROR
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

export function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    // Determine the current user's login status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    // Guard clauses: check for empty feedback or no logged-in user
    if (!feedback.trim()) {
      setFormMessage("Please enter your feedback before submitting.");
      return;
    }
    if (!currentUser) {
      setFormMessage("You must be logged in to submit feedback.");
      return;
    }

    setIsSubmitting(true);
    setFormMessage("Submitting your feedback...");

    try {
      // Add a new document to the "feedback" collection
      await addDoc(collection(db, "feedback"), {
        text: feedback,
        userId: currentUser.uid, // Link the feedback to the user
        userEmail: currentUser.email, // Optional: store email for convenience
        createdAt: serverTimestamp() // Let Firebase handle the timestamp
      });
      
      // Success!
      setFeedback(""); // Clear the textarea
      setFormMessage("Thank you! Your feedback has been submitted successfully.");

    } catch (error) {
      console.error("Error adding document: ", error);
      setFormMessage("Sorry, an error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If no user is logged in, show a message instead of the form
  if (!currentUser) {
    return (
        <div className="p-4 text-center bg-gray-100 rounded-lg">
            <p>Please log in to share your feedback.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Feedback</h2>
      <Textarea
        placeholder="Share your experience with the Smart OPD Agent..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="flex items-center space-x-4">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
        {formMessage && <p className="text-sm text-muted-foreground">{formMessage}</p>}
      </div>
    </div>
  )
}