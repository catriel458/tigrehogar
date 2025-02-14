import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Home, Moon, PlusCircle, Sun, User } from "lucide-react";
import { CartDialog } from "@/components/cart-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { items } = useCart();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span className="font-serif text-lg">Casa Comfort</span>
          </a>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>

          <div className="relative">
            <CartDialog />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {items.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </div>
          {user?.isAdmin && (
            <Link href="/add-product">
              <Button variant="ghost" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Agregar Producto
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    Mi Perfil
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}