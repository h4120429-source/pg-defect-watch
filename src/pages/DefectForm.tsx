import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PGLogo from "@/components/PGLogo";
import { getPlants, getLocations, getLines, IDU_DEFECTS, ODU_DEFECTS, UNIT_TYPES, SEVERITIES, ACTIONS } from "@/lib/constants";
import { getSession, isSessionValid } from "@/lib/session";
import { toast } from "@/hooks/use-toast";
import { LogOut, Clock } from "lucide-react";
import pcbIdu from "@/assets/pcb-idu.jpg";
import pcbOdu from "@/assets/pcb-odu.jpg";

const SHIFTS = ["Morning", "Evening"];

const DefectForm = () => {
  const navigate = useNavigate();
  const session = getSession();
  const plants = getPlants();
  const locations = getLocations();
  const lines = getLines();

  const [plant, setPlant] = useState("");
  const [location, setLocation] = useState("");
  const [line, setLine] = useState("");
  const [shift, setShift] = useState("");
  const [unitType, setUnitType] = useState("");
  const [defect, setDefect] = useState("");
  const [severity, setSeverity] = useState("");
  const [action, setAction] = useState("");
  const [model, setModel] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [remark, setRemark] = useState("");

  if (!session || !isSessionValid()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Session Expired</h2>
            <p className="text-sm text-muted-foreground mt-2">Your session has expired. Please request admin approval to log in again.</p>
            <Button onClick={() => navigate("/employee")} className="mt-4 bg-primary text-primary-foreground">Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defectsList = unitType === "IDU" ? IDU_DEFECTS : unitType === "ODU" ? ODU_DEFECTS : [];
  const pcbImage = unitType === "IDU" ? pcbIdu : unitType === "ODU" ? pcbOdu : null;

  const handleSubmit = () => {
    if (!plant || !location || !line || !shift || !unitType || !defect || !severity || !action || !model) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Defect report submitted successfully!" });
    setDefect(""); setModel(""); setQuantity("1"); setRemark("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PGLogo size="sm" />
          <span className="font-semibold text-foreground">Defect Report</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session.employeeName} ({session.employeeId})</span>
          <Button variant="outline" size="sm" onClick={() => navigate("/employee")}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* PCB Reference Image */}
        {pcbImage && (
          <Card className="mb-4">
            <CardContent className="pt-4 pb-4 flex flex-col items-center">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest mb-2">
                {unitType} PCB REFERENCE
              </p>
              <img src={pcbImage} alt={`${unitType} PCB Board`} className="max-h-48 rounded-lg border object-contain" />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Defect Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Plant *</Label>
                <Select value={plant} onValueChange={setPlant}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{plants.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location *</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{locations.map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Line *</Label>
                <Select value={line} onValueChange={setLine}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{lines.map((l: string) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Shift *</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Unit Type *</Label>
                <Select value={unitType} onValueChange={(v) => { setUnitType(v); setDefect(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{UNIT_TYPES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Defect *</Label>
                <Select value={defect} onValueChange={setDefect} disabled={!unitType}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{defectsList.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Severity *</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Action *</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Model *</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. MSA-12K" />
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Remark</Label>
              <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Optional remark..." />
            </div>
            <Button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground">Submit Defect Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DefectForm;
