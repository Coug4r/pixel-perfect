import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MECANICOS } from "@/data/mecanicos";
import { 
  Wrench, 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/mecanico/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => {
    const red = search["redirect"];
    return {
      redirect: typeof red === "string" ? red : undefined,
    };
  },
  component: MecanicoLoginPage,
});

function MecanicoLoginPage() {
  const { redirect } = Route.useSearch();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirect || "/mecanico/dashboard" });
    }
  }, [isAuthenticated, redirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !password) {
      setErrorMsg("Ingresa tu cédula y contraseña.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const session = await login(cedula.trim(), password);
      toast.success(`¡Bienvenido, ${session.user.nombre}!`);
      navigate({ to: redirect || "/mecanico/dashboard" });
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas.");
      toast.error(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (cedulaVal: string) => {
    setCedula(cedulaVal);
    setPassword("123456");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Wrench className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
              Portal de Mecánicos
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Acceso exclusivo para personal técnico autorizado del taller.
            </p>
          </div>

          <Card className="border border-border/80 shadow-lg bg-card">
            <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Autenticación de Técnico</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Ingresa con tu número de cédula y contraseña asignada.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2 border border-destructive/20 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="cedula" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Cédula de Identidad *</span>
                  </Label>
                  <Input
                    id="cedula"
                    type="text"
                    required
                    placeholder="Ej. 1100000001"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    maxLength={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span>Contraseña *</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 gap-2 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 mt-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isLoading ? "Verificando credenciales..." : "Iniciar Sesión"}</span>
                </Button>
              </form>
            </CardContent>

            {/* Quick Login Testing Assist */}
            <CardFooter className="flex flex-col items-start gap-2.5 p-4 sm:p-6 bg-muted/30 border-t border-border/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Acceso Rápido de Prueba (1 clic):</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Haz clic en cualquiera de los mecánicos para rellenar las credenciales (Contraseña: <strong>123456</strong>):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full pt-1">
                {MECANICOS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickLogin(m.cedula)}
                    className="flex flex-col items-start p-2 rounded-md border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="font-bold text-xs text-foreground leading-tight">{m.nombre.split(" ")[0]}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{m.cedula}</span>
                  </button>
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
