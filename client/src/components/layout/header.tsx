import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, User } from "lucide-react";
import { CartDialog } from "@/components/cart-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { items } = useCart();

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
                Add Product
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
                <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
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