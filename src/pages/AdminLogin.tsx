import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PGLogo from "@/components/PGLogo";
import { ADMIN_PASSWORD } from "@/lib/constants";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("pg_admin_auth", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="flex flex-col items-center mb-6">
            <PGLogo size="lg" />
            <h1 className="mt-4 text-xl font-bold text-foreground">PCB Defect Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter password to access dashboard</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter Password"
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

            <p className="text-xs text-center text-muted-foreground">Default password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
