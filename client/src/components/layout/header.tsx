import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span className="font-serif text-lg">Casa Comfort</span>
          </a>
        </Link>

        <Link href="/add-product">
          <Button variant="ghost" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
    </header>
  );
}
