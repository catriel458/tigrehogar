import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProductSchema, type InsertProduct, type Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { CategorySelect } from "@/components/category-select";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";

export default function EditProduct() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
    }
  });

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", Number(id)],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");
      const response = await apiRequest<Product>("GET", `/api/products/${id}`);
      return response;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (!id) throw new Error("Product ID is required");
      return await apiRequest<Product>("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="max-w-2xl mx-auto animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-[400px] bg-muted rounded" />
            </div>
          ) : !product ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>No se encontró el producto.</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  Volver al inicio
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Editar Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio (en pesos)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value / 100}
                              onChange={(e) =>
                                field.onChange(Math.round(parseFloat(e.target.value) * 100))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de la Imagen</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <FormControl>
                            <CategorySelect
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Actualizando..." : "Actualizar Producto"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}