import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AddProduct from "@/pages/add-product";
import AuthPage from "@/pages/auth";
import VerifyEmail from "@/pages/verify-email";
import ProfilePage from "@/pages/profile";
import { ProtectedRoute } from "@/components/protected-route";
import EditProduct from "@/pages/edit-product";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/verify-email" component={VerifyEmail} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/add-product" component={AddProduct} />
      <Route path="/edit-product/:id" component={EditProduct} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;