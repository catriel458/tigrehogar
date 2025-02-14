
import { useState } from "react";
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CartDialog() {
  const { items, total, removeItem, clearCart, addItem } = useCart();
  const { toast } = useToast();

  const [checkoutData, setCheckoutData] = useState({
    nombre: '',
    apellido: '',
    celular: ''
  });

  const handleCheckout = () => {
    if (!checkoutData.nombre || !checkoutData.apellido || !checkoutData.celular) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos antes de continuar",
        variant: "destructive"
      });
      return;
    }

    if (!checkoutData.celular.match(/^\d{10}$/)) {
      toast({
        title: "Número inválido",
        description: "Por favor ingresa un número de celular válido (10 dígitos)",
        variant: "destructive"
      });
      return;
    }

    const message = `¡Hola! Me interesa comprar los siguientes productos:%0A
${items.map(item => `- ${item.quantity}x ${item.name} ($${item.price/100})`).join('%0A')}
%0A
Total: $${total/100}%0A
%0A
Datos de contacto:%0A
Nombre: ${checkoutData.nombre}%0A
Apellido: ${checkoutData.apellido}%0A
Celular: ${checkoutData.celular}%0A
%0A
Me gustaría coordinar la entrega y el método de pago (efectivo o Mercado Pago).`;
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
                  <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price/100} c/u
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => addItem(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            for(let i = 0; i < item.quantity; i++) {
                              removeItem(item.id);
                            }
                          }}
                          className="ml-2"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <p className="font-medium">Total: ${total/100}</p>
                </div>
                <div className="space-y-4 mb-4">
                  <Input
                    placeholder="Tu nombre"
                    value={checkoutData.nombre}
                    onChange={(e) => setCheckoutData(prev => ({...prev, nombre: e.target.value}))}
                  />
                  <Input
                    placeholder="Tu apellido"
                    value={checkoutData.apellido}
                    onChange={(e) => setCheckoutData(prev => ({...prev, apellido: e.target.value}))}
                  />
                  <Input
                    placeholder="Tu celular (sin 0 y sin 15)"
                    value={checkoutData.celular}
                    onChange={(e) => setCheckoutData(prev => ({...prev, celular: e.target.value}))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Al finalizar la compra nos contactaremos a la brevedad para coordinar la entrega.
                    Aceptamos efectivo y Mercado Pago.
                  </p>
                </div>
                <Button onClick={handleCheckout} className="w-full">
                  Contactar por WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="w-full mt-2"
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
