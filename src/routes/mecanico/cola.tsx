import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

export const Route = createFileRoute("/mecanico/cola")({
  component: () => (
    <ProtectedRoute rol="mecanico">
      <MecanicoColaRedirect />
    </ProtectedRoute>
  ),
});

function MecanicoColaRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/mecanico/turnos", replace: true });
  }, [navigate]);

  return null;
}

