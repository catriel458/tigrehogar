
import { ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CartDialog() {
  const { items, total, removeItem, clearCart } = useCart();

  const [checkoutData, setCheckoutData] = useState({
    nombre: '',
    apellido: '',
    celular: ''
  });

  const handleCheckout = () => {
    if (!checkoutData.nombre || !checkoutData.apellido || !checkoutData.celular) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const message = `Hola! Me gustaría comprar los siguientes productos:%0A
${items.map(item => `- ${item.quantity}x ${item.name} ($${item.price/100})`).join('%0A')}
%0A
Total: $${total/100}%0A
%0A
Datos de contacto:%0A
Nombre: ${checkoutData.nombre}%0A
Apellido: ${checkoutData.apellido}%0A
Celular: ${checkoutData.celular}`;
    window.open(`https://wa.me/542213557519?text=${message}`, '_blank');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrito de compras</SheetTitle>
          <SheetDescription>
            {items.length === 0 ? (
              'Tu carrito está vacío'
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x ${item.price/100}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <p className="font-medium">Total: ${total/100}</p>
                </div>
                <div className="space-y-4 mb-4">
                  <Input
                    placeholder="Nombre"
                    value={checkoutData.nombre}
                    onChange={(e) => setCheckoutData(prev => ({...prev, nombre: e.target.value}))}
                  />
                  <Input
                    placeholder="Apellido"
                    value={checkoutData.apellido}
                    onChange={(e) => setCheckoutData(prev => ({...prev, apellido: e.target.value}))}
                  />
                  <Input
                    placeholder="Celular"
                    value={checkoutData.celular}
                    onChange={(e) => setCheckoutData(prev => ({...prev, celular: e.target.value}))}
                  />
                </div>
                <Button onClick={handleCheckout} className="w-full">
                  Finalizar compra
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="w-full"
                >
                  Vaciar carrito
                </Button>
              </div>
            )}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
