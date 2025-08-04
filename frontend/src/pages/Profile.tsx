import { ProfilePage } from "@/components/UserProfile/ProfilePage";

export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <main className="p-6">
          <ProfilePage />
        </main>
      </div>
    </div>
  );
}
