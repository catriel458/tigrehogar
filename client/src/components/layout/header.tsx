import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Home, Menu, Moon, PlusCircle, Sun, User } from "lucide-react";
import { CartDialog } from "@/components/cart-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { items } = useCart();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const DesktopMenu = () => (
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
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs">
            {cartItemCount}
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
  );

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Menú
              </h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  Cambiar tema
                </Button>

                <div className="relative">
                  <CartDialog />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </div>

                {user?.isAdmin && (
                  <Link href="/add-product">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <Separator />

            <div className="px-3 py-2">
              {user ? (
                <div className="space-y-1">
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span className="font-serif text-lg">Tigre Hogar</span>
          </a>
        </Link>

        {isMobile ? <MobileMenu /> : <DesktopMenu />}
      </div>
    </header>
  );
}