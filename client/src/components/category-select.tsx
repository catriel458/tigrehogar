import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

const normalizeCategory = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function CategorySelect({ value, onValueChange }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { toast } = useToast();

  const { data: categories = [], isLoading, refetch } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const normalizedName = normalizeCategory(name);

      // Verificar si la categoría ya existe (ignorando mayúsculas/minúsculas)
      const exists = categories.some(
        cat => cat.name.toLowerCase() === normalizedName.toLowerCase()
      );

      if (exists) {
        throw new Error("Esta categoría ya existe");
      }

      const response = await apiRequest<Category>("POST", "/api/categories", { 
        name: normalizedName 
      });
      console.log("API Response:", response);
      return response;
    },
    onSuccess: async (newCategory) => {
      console.log("Category created successfully:", newCategory);
      setNewCategory("");
      setIsOpen(false);

      // Actualizar la lista de categorías
      await queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      await refetch(); // Forzar una recarga inmediata

      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente.",
      });

      // Seleccionar la nueva categoría
      if (newCategory?.name) {
        onValueChange(newCategory.name);
      }
    },
    onError: (error: Error) => {
      console.error("Error creating category:", error);
      toast({
        title: "Error al crear la categoría",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate(newCategory);
  };

  // Ordenar categorías alfabéticamente
  const sortedCategories = [...categories].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  console.log("Current categories:", sortedCategories);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div>Cargando categorías...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sortedCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={value === category.name}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onValueChange(category.name);
                  } else {
                    onValueChange("");
                  }
                }}
              />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full mt-4"
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
    </div>
  );
}