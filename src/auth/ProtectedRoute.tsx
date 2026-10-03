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
  if (!user || user.rol !== rol) {
    return <Navigate to="/mecanico/login" search={{ redirect: location.href }} replace />;
  }
  return <>{children}</>;
}
