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
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          {isLoading ? (
            <span>Cargando categorías...</span>
          ) : (
            <SelectValue placeholder="Seleccionar categoría" />
          )}
        </SelectTrigger>
        <SelectContent>
          {sortedCategories.map((category) => (
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