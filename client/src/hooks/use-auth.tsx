import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { type User, type InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  forgotPasswordMutation: UseMutationResult<void, Error, { email: string }>;
};

type LoginData = {
  username: string;
  password: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/login", data);
      const jsonData = await res.json();
      console.log("Login response:", jsonData);
      return jsonData;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/me"], user);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.username}!`,
      });
      navigate("/"); // Redirigir a la página principal después del login
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      try {
        console.log("Register data:", data);
        const res = await apiRequest("POST", "/api/register", data);
        const jsonData = await res.json();
        console.log("Register response:", jsonData);
        if (!jsonData.user) {
          throw new Error(jsonData.error || "Error en el registro");
        }
        return jsonData.user;
      } catch (error) {
        console.error("Register error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Registro exitoso",
        description: "Por favor, verifica tu correo electrónico para continuar.",
      });
    },
    onError: (error: Error) => {
      console.error("Register mutation error:", error);
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      navigate("/auth"); // Redirigir al login después de cerrar sesión
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiRequest("POST", "/api/forgot-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        forgotPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}