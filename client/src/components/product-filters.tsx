import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@shared/schema";

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filters: {
    category: string | null;
    priceRange: [number, number];
  }) => void;
}

export function ProductFilters({ products, onFilterChange }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [maxPrice, setMaxPrice] = useState(1000000);

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Find max price among all products
  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(...products.map((p) => p.price));
      setMaxPrice(max);
      setPriceRange([0, max]);
      // Trigger initial filter with the correct price range
      onFilterChange({
        category: selectedCategory,
        priceRange: [0, max],
      });
    }
  }, [products]);

  const handlePriceChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    onFilterChange({
      category: selectedCategory,
      priceRange: newRange,
    });
  };

  const handleCategoryChange = (value: string) => {
    const category = value === "all" ? null : value;
    setSelectedCategory(category);
    onFilterChange({
      category,
      priceRange,
    });
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setPriceRange([0, maxPrice]);
    onFilterChange({
      category: null,
      priceRange: [0, maxPrice],
    });
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select
          value={selectedCategory || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Rango de Precios</Label>
        <div className="pt-2">
          <Slider
            min={0}
            max={maxPrice}
            step={1000}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={handlePriceChange}
            className="my-4"
          />
          <div className="flex justify-between text-sm">
            <span>${(priceRange[0] / 100).toFixed(2)}</span>
            <span>${(priceRange[1] / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={handleReset} className="w-full">
        Restablecer filtros
      </Button>
    </div>
  );
}