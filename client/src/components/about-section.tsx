import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Truck } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="bg-primary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl mb-4">About Casa Comfort</h2>
          <p className="text-muted-foreground">
            We believe that every home deserves to be a sanctuary of comfort and style.
            Our carefully curated collection of home essentials brings together quality,
            elegance, and functionality to help you create the perfect living space.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Quality Products</h3>
              <p className="text-muted-foreground">
                Every item is carefully selected to ensure the highest quality and durability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick and reliable shipping to bring comfort to your doorstep
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-serif text-xl mb-2">Secure Shopping</h3>
              <p className="text-muted-foreground">
                Shop with confidence knowing your information is protected
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1501685532562-aa6846b14a0e"
            alt="Cozy home interior"
            className="w-full h-[300px] object-cover"
          />
        </div>
      </div>
    </section>
  );
}
