import { Navigate, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import type { Rol } from "./types";

export function ProtectedRoute({ children, rol = "mecanico" }: { children: ReactNode; rol?: Rol }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (user.rol !== rol) {
    // If superadmin tries to access mechanic route, redirect to superadmin dashboard
    if (user.rol === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If mechanic tries to access superadmin route, redirect to mechanic dashboard
    return <Navigate to="/mecanico/dashboard" replace />;
  }
  return <>{children}</>;
}
