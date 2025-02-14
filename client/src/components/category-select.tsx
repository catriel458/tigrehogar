import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CategorySelect({ value, onValueChange }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const category = await apiRequest<Category>("POST", "/api/categories", { name });
      return category;
    },
    onSuccess: (category: Category) => {
      // Invalidar la consulta para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });

      // Actualizar el valor seleccionado con la nueva categoría
      if (category && category.name) {
        onValueChange(category.name);
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente.",
      });

      // Limpiar y cerrar el diálogo
      setNewCategory("");
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear la categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      createCategoryMutation.mutate(newCategory.trim());
    }
  };

  if (isLoading) {
    return <SelectTrigger>Cargando categorías...</SelectTrigger>;
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start font-normal"
                type="button"
              >
                + Agregar nueva categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar nueva categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nombre de la categoría"
                />
                <Button
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className="w-full"
                >
                  {createCategoryMutation.isPending
                    ? "Creando..."
                    : "Crear categoría"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </div>
  );
}