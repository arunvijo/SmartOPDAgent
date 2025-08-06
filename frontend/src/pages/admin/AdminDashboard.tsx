// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, addDoc, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// FIX: Added 'Bell' to the import list and removed unused icons like 'Building' and 'Star'
import { Users, Stethoscope, Bell } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface User { id: string; name: string; email: string; role: 'patient' | 'doctor' | 'admin'; specialization?: string; status?: 'pending' | 'approved' | 'rejected'; }
interface Department { id: string; name: string; }
interface Feedback { id: string; text: string; userId: string; doctorId: string; }

// --- SUB-COMPONENTS ---

// Doctor Management Tab
function DoctorManagement() {
    const [doctors, setDoctors] = useState<User[]>([]);
    const fetchDoctors = async () => {
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const snapshot = await getDocs(q);
        setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    };
    useEffect(() => { fetchDoctors(); }, []);
    const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
        await updateDoc(doc(db, "users", id), { status });
        fetchDoctors();
    };
    return (
        <Card>
            <CardHeader><CardTitle>Doctor Approvals</CardTitle><CardDescription>Approve or reject new doctor registrations.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {doctors.map(dr => (
                            <TableRow key={dr.id}>
                                <TableCell>{dr.name}</TableCell>
                                <TableCell>{dr.email}</TableCell>
                                <TableCell><Badge variant={dr.status === 'approved' ? 'default' : dr.status === 'pending' ? 'secondary' : 'destructive'}>{dr.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {dr.status === 'pending' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" onClick={() => handleApproval(dr.id, 'approved')}>Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleApproval(dr.id, 'rejected')}>Reject</Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Department Management Tab
function DepartmentManagement() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [newDeptName, setNewDeptName] = useState("");
    const fetchDepartments = async () => {
        const snapshot = await getDocs(collection(db, "departments"));
        setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    };
    useEffect(() => { fetchDepartments(); }, []);
    const handleAdd = async () => {
        if (!newDeptName.trim()) return;
        await addDoc(collection(db, "departments"), { name: newDeptName });
        setNewDeptName("");
        fetchDepartments();
    };
    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, "departments", id));
        fetchDepartments();
    };
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader><CardTitle>Add New Department</CardTitle></CardHeader>
                <CardContent className="flex gap-2">
                    <Input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="e.g., General Medicine" />
                    <Button onClick={handleAdd}>Add Department</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Existing Departments</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Department Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {departments.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.name}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button size="sm" variant="destructive">Delete</Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the department. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(d.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// User Management Tab
function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, "users"));
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        };
        fetchUsers();
    }, []);
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
        <Card>
            <CardHeader><CardTitle>All Users</CardTitle><CardDescription>View all registered users in the system.</CardDescription></CardHeader>
            <CardContent>
                <Input placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-4" />
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// Feedback Viewer Tab
function FeedbackManagement() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        const fetchData = async () => {
            // Fetch all users to create a lookup map for names
            const usersSnapshot = await getDocs(collection(db, "users"));
            const userMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data().name]));
            setUsersMap(userMap);

            // Fetch all feedback
            const feedbackSnapshot = await getDocs(collection(db, "feedback"));
            setFeedback(feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
        };
        fetchData();
    }, []);

    return (
        <Card>
            <CardHeader><CardTitle>Patient Feedback</CardTitle><CardDescription>Review feedback submitted by patients.</CardDescription></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Feedback</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {feedback.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{usersMap.get(item.userId) || 'Unknown Patient'}</TableCell>
                                <TableCell>{usersMap.get(item.doctorId) || 'Unknown Doctor'}</TableCell>
                                <TableCell>{item.text}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


// --- MAIN DASHBOARD COMPONENT ---
export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let patients = 0, doctors = 0, pending = 0;
        usersSnapshot.docs.forEach(doc => {
            const user = doc.data();
            if (user.role === 'patient') patients++;
            if (user.role === 'doctor') {
                doctors++;
                if (user.status === 'pending') pending++;
            }
        });
        setStats({ patients, doctors, pending });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management tools.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Patients</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.patients}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Doctors</CardTitle><Stethoscope className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.doctors}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Bell className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="doctors">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="doctors">Manage Doctors</TabsTrigger>
          <TabsTrigger value="departments">Manage Departments</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="feedback">View Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="mt-4"><DoctorManagement /></TabsContent>
        <TabsContent value="departments" className="mt-4"><DepartmentManagement /></TabsContent>
        <TabsContent value="users" className="mt-4"><UserManagement /></TabsContent>
        <TabsContent value="feedback" className="mt-4"><FeedbackManagement /></TabsContent>
      </Tabs>
    </div>
  );
}
