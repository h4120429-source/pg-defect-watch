import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PGLogo from "@/components/PGLogo";
import { createSession } from "@/lib/session";

const EmployeeLogin = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login — in production checks Firestore EmployeeUsers collection
    // Only admin-created employee IDs work
    if (employeeId && password) {
      createSession({
        employeeId,
        employeeName: "Employee",
        location: "Pune",
      });
      navigate("/employee/defect-form");
    } else {
      setError("Please enter Employee ID and Password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-6">
            <PGLogo size="lg" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Employee Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials provided by admin</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Employee ID" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setError(""); }} className="pl-10" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10"
              />
            </div>

            <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Login
            </Button>

            {error && <p className="text-sm text-center text-destructive">{error}</p>}

            <p className="text-xs text-center text-muted-foreground">
              Contact your admin to get login credentials
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
