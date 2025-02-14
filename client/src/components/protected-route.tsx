import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ReactNode, useEffect } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      console.log("Protected route: User not authorized, redirecting to home");
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!user?.isAdmin) {
    return null;
  }

  return <>{children}</>;
}