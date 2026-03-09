import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LogOut, RefreshCw, Download, Circle, Settings, Filter, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PGLogo from "@/components/PGLogo";
import { mockDefects } from "@/lib/mockData";
import { PLANTS, LINES, SHIFTS, LOCATIONS, LOCATION_PASSWORDS } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const COLORS = ["hsl(0, 78%, 42%)", "hsl(210, 70%, 50%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminLocation = localStorage.getItem("pg_admin_location") || "Pune";

  // Unlocked locations (admin's own location is always unlocked)
  const [unlockedLocations, setUnlockedLocations] = useState<string[]>([adminLocation]);

  // Filters - default to admin's location
  const [filterPlant, setFilterPlant] = useState("all");
  const [filterLocation, setFilterLocation] = useState(adminLocation);
  const [filterLine, setFilterLine] = useState("all");
  const [filterShift, setFilterShift] = useState("all");

  // Location password dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState("");
  const [locationPassword, setLocationPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Excel password dialog
  const [excelPasswordDialogOpen, setExcelPasswordDialogOpen] = useState(false);
  const [excelLocation, setExcelLocation] = useState("");
  const [excelPassword, setExcelPassword] = useState("");
  const [excelPasswordError, setExcelPasswordError] = useState("");

  const handleLocationChange = (value: string) => {
    if (value === "all") {
      // "All" requires all locations to be unlocked
      const locked = LOCATIONS.filter(l => !unlockedLocations.includes(l));
      if (locked.length > 0) {
        toast({ title: "Access Denied", description: "Unlock all locations first to view all data", variant: "destructive" });
        return;
      }
      setFilterLocation("all");
      return;
    }
    if (unlockedLocations.includes(value)) {
      setFilterLocation(value);
    } else {
      setPendingLocation(value);
      setLocationPassword("");
      setPasswordError("");
      setPasswordDialogOpen(true);
    }
  };

  const handleUnlockLocation = () => {
    if (LOCATION_PASSWORDS[pendingLocation] === locationPassword) {
      setUnlockedLocations(prev => [...prev, pendingLocation]);
      setFilterLocation(pendingLocation);
      setPasswordDialogOpen(false);
      toast({ title: "Unlocked", description: `${pendingLocation} data is now accessible` });
    } else {
      setPasswordError("Invalid password for this location");
    }
  };

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

  const exportToExcel = (loc?: string) => {
    const exportLocation = loc || filterLocation;
    const exportData = exportLocation === "all"
      ? mockDefects
      : mockDefects.filter(d => d.location === exportLocation);

    // Overall sheet
    const wsAll = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsAll, "All Defects");

    // Current month sheet
    const currentMonth = new Date().getMonth();
    const monthlyData = exportData.filter(d => new Date(d.timestamp).getMonth() === currentMonth);
    const wsMonth = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(wb, wsMonth, "Current Month");

    XLSX.writeFile(wb, `PG_Defect_Report_${exportLocation}.xlsx`);
    toast({ title: "Downloaded", description: `Excel report for ${exportLocation} exported` });
  };

  const handleExcelClick = () => {
    // Export current filtered location directly
    exportToExcel();
  };

  const handleExcelOtherLocation = (loc: string) => {
    if (unlockedLocations.includes(loc)) {
      exportToExcel(loc);
    } else {
      setExcelLocation(loc);
      setExcelPassword("");
      setExcelPasswordError("");
      setExcelPasswordDialogOpen(true);
    }
  };

  const handleExcelUnlock = () => {
    if (LOCATION_PASSWORDS[excelLocation] === excelPassword) {
      setUnlockedLocations(prev => [...prev, excelLocation]);
      exportToExcel(excelLocation);
      setExcelPasswordDialogOpen(false);
    } else {
      setExcelPasswordError("Invalid password for this location");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pg_admin_auth");
    localStorage.removeItem("pg_admin_location");
    localStorage.removeItem("pg_admin_email");
    navigate("/");
  };

  const clearFilters = () => {
    setFilterPlant("all");
    setFilterLocation(adminLocation);
    setFilterLine("all");
    setFilterShift("all");
  };

  const hasActiveFilters = filterPlant !== "all" || filterLocation !== adminLocation || filterLine !== "all" || filterShift !== "all";

  const qrUrl = `${window.location.origin}/employee`;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top section */}
      <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
        {/* Header */}
        <header className="bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PGLogo size="sm" />
            <div>
              <span className="font-semibold text-foreground text-sm md:text-base">PCB Defect Monitoring</span>
              <span className="ml-2 text-xs text-muted-foreground">({adminLocation})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[hsl(142,71%,45%)]">
              <Circle className="h-2.5 w-2.5 fill-current" />
              <span className="text-xs font-medium">LIVE</span>
            </div>
            {/* Excel export dropdown */}
            <div className="relative group">
              <Button size="sm" variant="outline" onClick={handleExcelClick} className="text-[hsl(142,71%,45%)] border-[hsl(142,71%,45%)] hover:bg-[hsl(142,71%,90%)]">
                <Download className="h-4 w-4 mr-1" /> Excel
              </Button>
            </div>
            <Button size="sm" variant="ghost"><RefreshCw className="h-4 w-4" /></Button>
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
          <Select value={filterLocation} onValueChange={handleLocationChange}>
            <SelectTrigger className="w-[150px] h-8 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(l => (
                <SelectItem key={l} value={l}>
                  <span className="flex items-center gap-1.5">
                    {l}
                    {!unlockedLocations.includes(l) && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </span>
                </SelectItem>
              ))}
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

        {/* Stats Cards + QR Card */}
        <div className="px-4 py-3 bg-card/80 backdrop-blur">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
            {/* QR Code Card */}
            <Card className="shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.open(qrUrl, "_blank")}>
              <CardContent className="pt-2 pb-2 flex flex-col items-center justify-center">
                <QRCodeSVG value={qrUrl} size={48} />
                <p className="text-[9px] font-semibold text-muted-foreground tracking-widest mt-1">SCAN TO REPORT</p>
              </CardContent>
            </Card>
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Defect Reports ({defects.length})</CardTitle>
              <div className="flex gap-1">
                {LOCATIONS.filter(l => l !== filterLocation).map(l => (
                  <Button key={l} size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleExcelOtherLocation(l)}>
                    <Download className="h-3 w-3 mr-1" /> {l}
                    {!unlockedLocations.includes(l) && <Lock className="h-3 w-3 ml-1" />}
                  </Button>
                ))}
              </div>
            </div>
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

      {/* Location Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Access {pendingLocation} Data</DialogTitle>
            <DialogDescription>Enter the location password to view {pendingLocation} data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Password for {pendingLocation}</Label>
              <Input
                type="password"
                value={locationPassword}
                onChange={(e) => { setLocationPassword(e.target.value); setPasswordError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlockLocation()}
                placeholder="Enter location password"
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button onClick={handleUnlockLocation} className="w-full bg-primary text-primary-foreground">
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excel Password Dialog */}
      <Dialog open={excelPasswordDialogOpen} onOpenChange={setExcelPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Export {excelLocation} Data</DialogTitle>
            <DialogDescription>Enter the location password to export {excelLocation} defect data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Password for {excelLocation}</Label>
              <Input
                type="password"
                value={excelPassword}
                onChange={(e) => { setExcelPassword(e.target.value); setExcelPasswordError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleExcelUnlock()}
                placeholder="Enter location password"
              />
            </div>
            {excelPasswordError && <p className="text-sm text-destructive">{excelPasswordError}</p>}
            <Button onClick={handleExcelUnlock} className="w-full bg-primary text-primary-foreground">
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
