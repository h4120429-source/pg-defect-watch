import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LogOut, RefreshCw, QrCode, Download, Circle, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PGLogo from "@/components/PGLogo";
import { mockDefects } from "@/lib/mockData";
import { PLANTS, LOCATIONS, LINES, SHIFTS } from "@/lib/constants";
import * as XLSX from "xlsx";

const COLORS = ["hsl(0, 78%, 42%)", "hsl(210, 70%, 50%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Filters
  const [filterPlant, setFilterPlant] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterLine, setFilterLine] = useState("all");
  const [filterShift, setFilterShift] = useState("all");

  const defects = useMemo(() => {
    return mockDefects.filter(d => {
      if (filterPlant !== "all" && d.plant !== filterPlant) return false;
      if (filterLocation !== "all" && d.location !== filterLocation) return false;
      if (filterLine !== "all" && d.line !== filterLine) return false;
      if (filterShift !== "all" && d.shift !== filterShift) return false;
      return true;
    });
  }, [filterPlant, filterLocation, filterLine, filterShift]);

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

  const defectTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    defects.forEach(d => { map[d.defect] = (map[d.defect] || 0) + d.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);

  const locationData = useMemo(() => {
    const map: Record<string, number> = {};
    defects.forEach(d => { map[d.location] = (map[d.location] || 0) + d.quantity; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [defects]);

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

  const clearFilters = () => {
    setFilterPlant("all");
    setFilterLocation("all");
    setFilterLine("all");
    setFilterShift("all");
  };

  const hasActiveFilters = filterPlant !== "all" || filterLocation !== "all" || filterLine !== "all" || filterShift !== "all";

  const qrUrl = `${window.location.origin}/employee`;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top section */}
      <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
        {/* Header */}
        <header className="bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PGLogo size="sm" />
            <span className="font-semibold text-foreground text-sm md:text-base">PCB Defect Monitoring Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[hsl(142,71%,45%)]">
              <Circle className="h-2.5 w-2.5 fill-current" />
              <span className="text-xs font-medium">LIVE</span>
            </div>
            <Button size="sm" variant="outline" onClick={exportToExcel} className="text-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,90%)]">
              <Download className="h-4 w-4 mr-1" /> Excel
            </Button>
            <Button size="sm" variant="ghost"><RefreshCw className="h-4 w-4" /></Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost"><QrCode className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Employee QR Code</DialogTitle>
                  <DialogDescription>Employees scan this QR code to access the login page</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <QRCodeSVG value={qrUrl} size={200} />
                  <code className="text-xs bg-muted px-2 py-1 rounded">{qrUrl}</code>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/portal")}>
              <Settings className="h-4 w-4 mr-1" /> Admin Portal
            </Button>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="px-4 py-2 bg-card/80 backdrop-blur flex flex-wrap items-center gap-2 border-t">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPlant} onValueChange={setFilterPlant}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              {PLANTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLine} onValueChange={setFilterLine}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              {LINES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterShift} onValueChange={setFilterShift}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 text-xs text-destructive">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-3 bg-card/80 backdrop-blur">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "TODAY'S", value: stats.todayCount },
              { label: "YESTERDAY", value: stats.yesterdayCount },
              { label: "AVG DAILY", value: stats.avgDaily },
              { label: "THIS MONTH", value: stats.thisMonth },
              { label: "TOTAL", value: stats.total },
              { label: "RECORDS", value: stats.records },
            ].map((s) => (
              <Card key={s.label} className="shadow-sm">
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-widest">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="p-4 space-y-4">
        {/* Charts Row 1 */}
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
            <CardHeader className="pb-2"><CardTitle className="text-sm">Defect Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={defectTypeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}>
                    {defectTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
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
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Location Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(0, 78%, 42%)" />
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

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Major", value: defects.filter(d => d.severity === "Major").reduce((s, d) => s + d.quantity, 0) },
                      { name: "Minor", value: defects.filter(d => d.severity === "Minor").reduce((s, d) => s + d.quantity, 0) },
                    ]}
                    cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    <Cell fill="hsl(0, 78%, 42%)" />
                    <Cell fill="hsl(38, 92%, 50%)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Defect Reports Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Defect Reports ({defects.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Defect</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                      No defects found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  defects.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(d.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{d.plant}</TableCell>
                      <TableCell>{d.location}</TableCell>
                      <TableCell>{d.line}</TableCell>
                      <TableCell>{d.shift}</TableCell>
                      <TableCell>{d.unitType}</TableCell>
                      <TableCell>{d.defect}</TableCell>
                      <TableCell>
                        <Badge variant={d.severity === "Major" ? "destructive" : "secondary"}>{d.severity}</Badge>
                      </TableCell>
                      <TableCell>{d.action}</TableCell>
                      <TableCell>{d.model}</TableCell>
                      <TableCell>{d.quantity}</TableCell>
                      <TableCell className="text-xs">{d.employeeName}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{d.remark || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
