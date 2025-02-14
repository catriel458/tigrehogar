import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddProduct() {
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
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("category", data.category);

      if (data.image instanceof File) {
        formData.append("image", data.image);
      } else {
        formData.append("image", data.image as string);
      }

      return apiRequest(
        "POST",
        "/api/products",
        formData,
        {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Producto agregado",
        description: "Tu producto ha sido agregado a la tienda.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al agregar producto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Agregar Nuevo Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))} 
                className="space-y-4"
                encType="multipart/form-data"
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
                          onChange={e => field.onChange(Math.round(parseFloat(e.target.value) * 100))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL de Imagen</TabsTrigger>
                    <TabsTrigger value="file">Subir Imagen</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de la Imagen</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              onChange={(e) => field.onChange(e.target.value)}
                              value={typeof field.value === 'string' ? field.value : ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Ingresa la URL de la imagen del producto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="file">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subir Imagen</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Selecciona una imagen de tu ordenador
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Agregando..." : "Agregar Producto"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}