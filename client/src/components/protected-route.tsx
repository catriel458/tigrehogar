import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }

  return <>{children}</>;
}