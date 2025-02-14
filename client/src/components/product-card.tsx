
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.isAdmin;
  const [, navigate] = useLocation();

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(product.price / 100);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/products/${product.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-serif">{product.name}</CardTitle>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">{formattedPrice}</p>
          <Button 
            onClick={() => {
              if (!user) {
                navigate('/auth');
                return;
              }
              useCart.getState().addItem(product);
            }} 
            variant="default" 
            size="sm"
          >
            Agregar al carrito
          </Button>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/edit-product/${product.id}`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
