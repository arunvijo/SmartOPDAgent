// src/pages/doctor/PendingApproval.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "lucide-react";

export default function DoctorPendingPage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit">
                        <Hourglass className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="mt-4">Application Pending</CardTitle>
                    <CardDescription>
                        Thank you for registering. Your profile is currently under review by an administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        You will be notified via email once your account has been approved. You will not be able to access the Doctor Dashboard until then.
                    </p>
                    <Button onClick={handleLogout} className="mt-6 w-full">
                        Logout
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
