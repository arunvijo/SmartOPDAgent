// src/components/UserProfile/ProfilePage.tsx

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  age?: number | string; // Allow string for input field
  insurance?: string;
}

export function ProfilePage() {
  const { currentUser, userProfile, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When the user profile from context loads, set it to our local state
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleSave = async () => {
    if (!currentUser || !profile) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      // Prepare data for update, converting age to a number
      const dataToUpdate = {
        ...profile,
        age: profile.age ? Number(profile.age) : null,
      };
      await updateDoc(userDocRef, dataToUpdate);
      setIsEditing(false); // Exit editing mode on successful save
    } catch (error) {
      console.error("Error updating profile:", error);
      // Optionally show an error message to the user
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10">
        <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
        <CardContent className="space-y-4"><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (!currentUser || !profile) {
    return <div className="text-center p-6">Please log in to view your profile.</div>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          {isEditing ? "Update your personal information below." : "View your personal information."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          // EDITING MODE
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile.name || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" value={profile.age || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance</Label>
              <Input id="insurance" value={profile.insurance || ''} onChange={handleInputChange} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          // VIEW MODE
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Name:</span> <strong>{profile.name || "Not set"}</strong></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Email:</span> <strong>{profile.email}</strong></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Age:</span> <strong>{profile.age || "Not set"}</strong></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Insurance:</span> <strong>{profile.insurance || "Not set"}</strong></div>
            <Button className="w-full mt-4" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
