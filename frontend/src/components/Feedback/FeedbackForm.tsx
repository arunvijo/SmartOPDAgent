// src/components/Feedback/FeedbackForm.tsx

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "../../services/firebase";
import { Label } from "@/components/ui/label";

// Define structures for our data
interface Department {
  id: string;
  name: string;
}
interface Doctor {
  id: string; // This will be the user's UID
  name: string;
}

export function FeedbackForm() {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Effect 1: Fetch all departments when the component loads
  useEffect(() => {
    const fetchDepartments = async () => {
      const querySnapshot = await getDocs(collection(db, "departments"));
      const depts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(depts);
    };
    fetchDepartments();
  }, []);

  // Effect 2: Fetch doctors whenever a department is selected
  useEffect(() => {
    if (selectedDept) {
      const fetchDoctors = async () => {
        setDoctors([]); // Clear previous list
        setSelectedDoctor("");
        const q = query(
          collection(db, "users"),
          where("role", "==", "doctor"),
          where("status", "==", "approved"), // Only show approved doctors
          where("departmentId", "==", selectedDept)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Doctor));
        setDoctors(docs);
      };
      fetchDoctors();
    }
  }, [selectedDept]);

  const handleSubmit = async () => {
    if (!currentUser) {
      setFormMessage("You must be logged in to submit feedback.");
      return;
    }
    if (!selectedDoctor || !feedback.trim()) {
      setFormMessage("Please select a doctor and provide your feedback.");
      return;
    }

    setIsSubmitting(true);
    setFormMessage("Submitting your feedback...");

    try {
      await addDoc(collection(db, "feedback"), {
        text: feedback,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        doctorId: selectedDoctor,
        departmentId: selectedDept,
        createdAt: serverTimestamp()
      });
      
      setFeedback("");
      setSelectedDept("");
      setSelectedDoctor("");
      setFormMessage("Thank you! Your feedback has been submitted.");

    } catch (error) {
      console.error("Error adding document: ", error);
      setFormMessage("Sorry, an error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="p-4 text-center bg-muted rounded-lg">
        <p>Please log in to share your feedback.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Share Your Experience</h2>
        <p className="text-muted-foreground">Your feedback helps us improve our services.</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger id="department">
                        <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={!selectedDept || doctors.length === 0}>
                    <SelectTrigger id="doctor">
                        <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                        {doctors.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
                id="feedback"
                placeholder="Tell us about your experience with the doctor and the hospital..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
                rows={5}
            />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
        {formMessage && <p className="text-sm text-muted-foreground">{formMessage}</p>}
      </div>
    </div>
  );
}
