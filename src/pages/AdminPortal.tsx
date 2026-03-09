import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, CheckCircle, XCircle, Clock, Users, KeyRound, Plus, Trash2, Factory, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PGLogo from "@/components/PGLogo";
import { mockEmployees, mockSessionRequests } from "@/lib/mockData";
import { getPlants, getLines, getLocations, setPlants, setLines, setLocations } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import type { Employee, SessionRequest } from "@/lib/types";

const AdminPortal = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [sessionReqs, setSessionReqs] = useState<SessionRequest[]>(mockSessionRequests);

  // CRUD state
  const [plants, setPlantsState] = useState<string[]>(getPlants());
  const [linesList, setLinesState] = useState<string[]>(getLines());
  const [locationsList, setLocationsState] = useState<string[]>(getLocations());
  const [newPlant, setNewPlant] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // New employee user form
  const [newName, setNewName] = useState("");
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmpLocation, setNewEmpLocation] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const pendingEmployees = employees.filter(e => e.status === "pending");
  const pendingSessions = sessionReqs.filter(s => s.status === "pending");

  const handleApproveEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "approved" as const, approvedAt: new Date().toISOString() } : e));
    toast({ title: "Approved", description: "Employee registration approved successfully" });
  };

  const handleRejectEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" as const } : e));
    toast({ title: "Rejected", description: "Employee registration rejected" });
  };

  const handleApproveSession = (id: string) => {
    setSessionReqs(prev => prev.map(s => s.id === id ? { ...s, status: "approved" as const, approvedAt: new Date().toISOString() } : s));
    toast({ title: "Approved", description: "Session request approved. Employee can now login for 12 hours." });
  };

  const handleCreateUser = () => {
    if (!newName || !newEmployeeId || !newPassword || !newEmpLocation) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    toast({ title: "User Created", description: `Employee ${newName} (${newEmployeeId}) has been created.` });
    setNewName(""); setNewEmployeeId(""); setNewPassword(""); setNewEmpLocation("");
    setCreateDialogOpen(false);
  };

  // CRUD handlers
  const addPlant = () => {
    if (!newPlant.trim()) return;
    if (plants.includes(newPlant.trim())) { toast({ title: "Error", description: "Plant already exists", variant: "destructive" }); return; }
    const updated = [...plants, newPlant.trim()];
    setPlantsState(updated); setPlants(updated); setNewPlant("");
    toast({ title: "Added", description: `Plant "${newPlant.trim()}" added` });
  };
  const removePlant = (p: string) => {
    const updated = plants.filter(x => x !== p);
    setPlantsState(updated); setPlants(updated);
    toast({ title: "Removed", description: `Plant "${p}" removed` });
  };

  const addLine = () => {
    if (!newLine.trim()) return;
    if (linesList.includes(newLine.trim())) { toast({ title: "Error", description: "Line already exists", variant: "destructive" }); return; }
    const updated = [...linesList, newLine.trim()];
    setLinesState(updated); setLines(updated); setNewLine("");
    toast({ title: "Added", description: `Line "${newLine.trim()}" added` });
  };
  const removeLine = (l: string) => {
    const updated = linesList.filter(x => x !== l);
    setLinesState(updated); setLines(updated);
    toast({ title: "Removed", description: `Line "${l}" removed` });
  };

  const addLocation = () => {
    if (!newLocation.trim()) return;
    if (locationsList.includes(newLocation.trim())) { toast({ title: "Error", description: "Location already exists", variant: "destructive" }); return; }
    const updated = [...locationsList, newLocation.trim()];
    setLocationsState(updated); setLocations(updated); setNewLocation("");
    toast({ title: "Added", description: `Location "${newLocation.trim()}" added` });
  };
  const removeLocation = (l: string) => {
    const updated = locationsList.filter(x => x !== l);
    setLocationsState(updated); setLocations(updated);
    toast({ title: "Removed", description: `Location "${l}" removed` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PGLogo size="sm" />
          <span className="font-semibold text-foreground">Admin Portal</span>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <UserPlus className="h-4 w-4 mr-1" /> Create Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Employee User</DialogTitle>
              <DialogDescription>Create login credentials for an employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Employee Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} placeholder="e.g. EMP005" />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set password" />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select value={newEmpLocation} onValueChange={setNewEmpLocation}>
                  <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                  <SelectContent>
                    {locationsList.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateUser} className="w-full bg-primary text-primary-foreground">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(38,92%,90%)] flex items-center justify-center">
                <Clock className="h-5 w-5 text-[hsl(38,92%,50%)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Registrations</p>
                <p className="text-xl font-bold">{pendingEmployees.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(199,89%,90%)] flex items-center justify-center">
                <KeyRound className="h-5 w-5 text-[hsl(199,89%,48%)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Sessions</p>
                <p className="text-xl font-bold">{pendingSessions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(142,71%,90%)] flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[hsl(142,71%,45%)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved Employees</p>
                <p className="text-xl font-bold">{employees.filter(e => e.status === "approved").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="registrations">
          <TabsList className="flex-wrap">
            <TabsTrigger value="registrations">
              Registrations {pendingEmployees.length > 0 && <Badge variant="destructive" className="ml-2 text-xs">{pendingEmployees.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sessions">
              Sessions {pendingSessions.length > 0 && <Badge variant="destructive" className="ml-2 text-xs">{pendingSessions.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="all-employees">All Employees</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Registration Requests */}
          <TabsContent value="registrations">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Registration Requests</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Employee ID</TableHead>
                      <TableHead>Plant</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-xs">{e.email}</TableCell>
                        <TableCell>{e.employeeId}</TableCell>
                        <TableCell>{e.plant}</TableCell>
                        <TableCell className="text-xs">{new Date(e.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={e.status === "approved" ? "default" : e.status === "rejected" ? "destructive" : "secondary"}
                            className={e.status === "approved" ? "bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)]" : ""}>
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {e.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => handleApproveEmployee(e.id)} className="h-7 text-xs bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)] text-white">
                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectEmployee(e.id)} className="h-7 text-xs">
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Requests */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Session Re-login Requests</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead><TableHead>Employee ID</TableHead><TableHead>Location</TableHead>
                      <TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionReqs.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No session requests</TableCell></TableRow>
                    ) : sessionReqs.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.employeeName}</TableCell>
                        <TableCell>{s.employeeId}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell className="text-xs">{new Date(s.requestedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "approved" ? "default" : "secondary"}
                            className={s.status === "approved" ? "bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)]" : ""}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.status === "pending" && (
                            <Button size="sm" onClick={() => handleApproveSession(s.id)} className="h-7 text-xs bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)] text-white">
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Employees */}
          <TabsContent value="all-employees">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">All Registered Employees</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Employee ID</TableHead>
                      <TableHead>Plant</TableHead><TableHead>Status</TableHead><TableHead>Registered</TableHead><TableHead>Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell className="text-xs">{e.email}</TableCell>
                        <TableCell>{e.employeeId}</TableCell>
                        <TableCell>{e.plant}</TableCell>
                        <TableCell>
                          <Badge variant={e.status === "approved" ? "default" : e.status === "rejected" ? "destructive" : "secondary"}
                            className={e.status === "approved" ? "bg-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,40%)]" : ""}>
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(e.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs">{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration - CRUD for Plants, Lines, Locations */}
          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plants */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Factory className="h-4 w-4" /> Plants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={newPlant} onChange={(e) => setNewPlant(e.target.value)} placeholder="New plant name"
                      onKeyDown={(e) => e.key === "Enter" && addPlant()} className="h-8 text-sm" />
                    <Button size="sm" onClick={addPlant} className="h-8"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-1">
                    {plants.map(p => (
                      <div key={p} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <span className="text-sm font-medium">{p}</span>
                        <Button size="sm" variant="ghost" onClick={() => removePlant(p)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lines */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" /> Lines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={newLine} onChange={(e) => setNewLine(e.target.value)} placeholder="New line name"
                      onKeyDown={(e) => e.key === "Enter" && addLine()} className="h-8 text-sm" />
                    <Button size="sm" onClick={addLine} className="h-8"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-1">
                    {linesList.map(l => (
                      <div key={l} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <span className="text-sm font-medium">{l}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeLine(l)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Locations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="New location"
                      onKeyDown={(e) => e.key === "Enter" && addLocation()} className="h-8 text-sm" />
                    <Button size="sm" onClick={addLocation} className="h-8"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="space-y-1">
                    {locationsList.map(l => (
                      <div key={l} className="flex items-center justify-between p-2 rounded-md bg-muted">
                        <span className="text-sm font-medium">{l}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeLocation(l)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPortal;
