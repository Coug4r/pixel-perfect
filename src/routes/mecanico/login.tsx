import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  ShieldAlert,
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
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect according to role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol === "superadmin") {
        navigate({ to: redirect || "/admin/dashboard", replace: true });
      } else {
        navigate({ to: redirect || "/mecanico/dashboard", replace: true });
      }
    }
  }, [isAuthenticated, user, redirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !password) {
      setErrorMsg("Por favor ingresa tu cédula y contraseña.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const session = await login(cedula.trim(), password);
      toast.success(`¡Bienvenido, ${session.user.nombre}!`);
      if (session.user.rol === "superadmin") {
        navigate({ to: redirect || "/admin/dashboard", replace: true });
      } else {
        navigate({ to: redirect || "/mecanico/dashboard", replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas.");
      toast.error(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCedulaChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    setCedula(numeric);
  };

  const handleQuickLogin = (cedulaVal: string, passVal: string) => {
    setCedula(cedulaVal);
    setPassword(passVal);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Lock className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
              Portal del Personal
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Acceso seguro para Técnicos Mecánicos y Superadministrador.
            </p>
          </div>

          <Card className="border border-border/80 shadow-xl bg-card">
            <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Autenticación de Usuario</span>
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
                    placeholder="Ej. 1100000000 o 0928374651"
                    value={cedula}
                    onChange={(e) => handleCedulaChange(e.target.value)}
                    maxLength={10}
                    className="font-mono text-sm h-11"
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
                    className="font-mono text-sm h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || cedula.length < 10 || !password}
                  className="w-full min-h-[48px] gap-2 bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 mt-2 shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{isLoading ? "Verificando credenciales..." : "Iniciar Sesión"}</span>
                </Button>
              </form>
            </CardContent>

            {/* Quick Login Testing Assist */}
            <CardFooter className="flex flex-col items-start gap-3 p-4 sm:p-6 bg-muted/30 border-t border-border/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Acceso Rápido de Prueba:</span>
              </div>

              {/* Superadmin shortcut */}
              <button
                type="button"
                onClick={() => handleQuickLogin("1100000000", "admin123")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-bold text-xs text-foreground block">Superadmin (Administrador General)</span>
                    <span className="font-mono text-[11px] text-muted-foreground">CI: 1100000000 • Pass: admin123</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded">
                  SUPERADMIN
                </span>
              </button>

              {/* Mechanics shortcuts */}
              <div className="w-full space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Técnicos Mecánicos (Contraseña: 123456):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 w-full">
                  {MECANICOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleQuickLogin(m.cedula, "123456")}
                      className="flex flex-col items-start p-2 rounded-md border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <span className="font-bold text-xs text-foreground leading-tight flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-primary" />
                        {m.nombre.split(" ")[0]}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{m.cedula}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
