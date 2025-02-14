
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Truck } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="bg-primary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl mb-4">Sobre Casa Comfort</h2>
          <p className="text-muted-foreground">
            Somos tu tienda de confianza en Tigre, ofreciendo una cuidadosa selección de 
            artículos para el hogar, ropa y más. Nuestro compromiso es brindarte productos 
            de calidad a precios accesibles, con la comodidad de entregas en Zona Norte y Capital.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Calidad Garantizada</h3>
              <p className="text-muted-foreground">
                Seleccionamos cuidadosamente cada producto para asegurar la mejor calidad
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Entregas Seguras</h3>
              <p className="text-muted-foreground">
                Envíos a Zona Norte y Capital Federal, coordinados según tu ubicación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Compra Segura</h3>
              <p className="text-muted-foreground">
                Aceptamos efectivo y Mercado Pago para tu comodidad
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <img 
            src="https://www.tigre.gob.ar/public/assets/fotos_novedades/1582895164.jpg"
            alt="Municipio de Tigre"
            className="w-full max-h-[400px] object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}
