import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LogOut, RefreshCw, QrCode, Download, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PGLogo from "@/components/PGLogo";
import { mockDefects, mockEmployees, mockSessionRequests } from "@/lib/mockData";
import type { Employee, SessionRequest } from "@/lib/types";
import * as XLSX from "xlsx";

const COLORS = ["hsl(0, 78%, 42%)", "hsl(210, 70%, 50%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(mockEmployees);
  const [sessionReqs, setSessionReqs] = useState(mockSessionRequests);

  const defects = mockDefects;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const stats = useMemo(() => {
    const todayCount = defects.filter(d => new Date(d.timestamp).toDateString() === today).reduce((s, d) => s + d.quantity, 0);
    const yesterdayCount = defects.filter(d => new Date(d.timestamp).toDateString() === yesterday).reduce((s, d) => s + d.quantity, 0);
    const total = defects.reduce((s, d) => s + d.quantity, 0);
    const thisMonth = defects.filter(d => new Date(d.timestamp).getMonth() === new Date().getMonth()).reduce((s, d) => s + d.quantity, 0);
    const days = new Set(defects.map(d => new Date(d.timestamp).toDateString())).size || 1;
    return { todayCount, yesterdayCount, total, thisMonth, avgDaily: (total / days).toFixed(1), records: defects.length };
  }, [defects]);

  const plantData = useMemo(() => {
    const map: Record<string, number> = {};
    defects.forEach(d => { map[d.plant] = (map[d.plant] || 0) + d.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);

  const shiftData = useMemo(() => {
    const map: Record<string, number> = {};
    defects.forEach(d => { map[d.shift] = (map[d.shift] || 0) + d.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);

  const actionData = useMemo(() => {
    const map: Record<string, number> = {};
    defects.forEach(d => { map[d.action] = (map[d.action] || 0) + d.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);

  const handleApproveEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "approved" as const, approvedAt: new Date().toISOString() } : e));
  };

  const handleRejectEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" as const } : e));
  };

  const handleApproveSession = (id: string) => {
    setSessionReqs(prev => prev.map(s => s.id === id ? { ...s, status: "approved" as const, approvedAt: new Date().toISOString() } : s));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(defects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Defects");
    XLSX.writeFile(wb, "PG_Defect_Report.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem("pg_admin_auth");
    navigate("/");
  };

  const qrUrl = `${window.location.origin}/employee`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PGLogo size="sm" />
          <span className="font-semibold text-foreground">PCB Defect Monitoring Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[hsl(var(--success))]">
            <Circle className="h-2.5 w-2.5 fill-current" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
          <Button size="sm" variant="outline" onClick={exportToExcel} className="text-[hsl(var(--success))]">
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button size="sm" variant="ghost"><RefreshCw className="h-4 w-4" /></Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost"><QrCode className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Employee QR Code</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <QRCodeSVG value={qrUrl} size={200} />
                <p className="text-sm text-muted-foreground text-center">Employees scan this QR to access the login page</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">{qrUrl}</code>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "TODAY'S", value: stats.todayCount },
            { label: "YESTERDAY", value: stats.yesterdayCount },
            { label: "AVG DAILY", value: stats.avgDaily },
            { label: "THIS MONTH", value: stats.thisMonth },
            { label: "TOTAL", value: stats.total },
            { label: "RECORDS", value: stats.records },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs font-medium text-muted-foreground tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Plant Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={plantData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {plantData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Shift-wise Defects</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shiftData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(199, 89%, 48%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Action Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={actionData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
                    {actionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="defects">
          <TabsList>
            <TabsTrigger value="defects">Defect Reports</TabsTrigger>
            <TabsTrigger value="employees">
              Employee Requests
              {employees.filter(e => e.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{employees.filter(e => e.status === "pending").length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions">
              Session Requests
              {sessionReqs.filter(s => s.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{sessionReqs.filter(s => s.status === "pending").length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="defects">
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Plant</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Line</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Defect</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Employee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defects.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs">{new Date(d.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{d.plant}</TableCell>
                        <TableCell>{d.location}</TableCell>
                        <TableCell>{d.line}</TableCell>
                        <TableCell>{d.unitType}</TableCell>
                        <TableCell>{d.defect}</TableCell>
                        <TableCell>
                          <Badge variant={d.severity === "Major" ? "destructive" : "secondary"}>{d.severity}</Badge>
                        </TableCell>
                        <TableCell>{d.action}</TableCell>
                        <TableCell>{d.quantity}</TableCell>
                        <TableCell className="text-xs">{d.employeeName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Plant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.name}</TableCell>
                        <TableCell className="text-xs">{e.email}</TableCell>
                        <TableCell>{e.employeeId}</TableCell>
                        <TableCell>{e.plant}</TableCell>
                        <TableCell>
                          <Badge variant={e.status === "approved" ? "default" : e.status === "rejected" ? "destructive" : "secondary"}>
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{new Date(e.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {e.status === "pending" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => handleApproveEmployee(e.id)}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectEmployee(e.id)}>Reject</Button>
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

          <TabsContent value="sessions">
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionReqs.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.employeeName}</TableCell>
                        <TableCell>{s.employeeId}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell className="text-xs">{new Date(s.requestedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "approved" ? "default" : "secondary"}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {s.status === "pending" && (
                            <Button size="sm" onClick={() => handleApproveSession(s.id)}>Approve</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
